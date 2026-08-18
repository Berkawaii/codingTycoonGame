using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using CodingTycoon.Wasm.Interfaces;

namespace CodingTycoon.Wasm.Services
{
    public class RobotExecutionLog
    {
        public string Action { get; set; } = string.Empty; // "MOVE", "MINE", "ROTATE"
        public string Payload { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class CompilationResult
    {
        public bool Success { get; set; }
        public List<string> Diagnostics { get; set; } = new();
        public List<RobotExecutionLog> Logs { get; set; } = new();
    }

    public class RobotInstance : IRobot
    {
        public int X { get; set; }
        public int Y { get; set; }
        public Direction CurrentDirection { get; set; }
        public int Energy { get; set; } = 100;
        public List<Tile> NearbyTiles { get; set; } = new();
        public List<RobotExecutionLog> Logs { get; } = new();

        public void Move(Direction direction)
        {
            CurrentDirection = direction;
            Logs.Add(new RobotExecutionLog
            {
                Action = "MOVE",
                Payload = direction.ToString().ToUpper(),
                Message = $"Robot {direction} yönüne hareket etti."
            });
        }

        public bool Mine()
        {
            Logs.Add(new RobotExecutionLog
            {
                Action = "MINE",
                Payload = "CURRENT_TILE",
                Message = "Robot bulunduğu karede maden kazdı."
            });
            return true;
        }

        public Tile GetTileInfo(Direction direction)
        {
            // Simple mock or nearby tile lookup
            return NearbyTiles.FirstOrDefault() ?? new Tile { X = X, Y = Y, HasResource = true, ResourceType = "IRON_ORE", Amount = 100 };
        }

        public int GetEnergy() => Energy;
    }

    public class CodeRunnerService
    {
        private static readonly List<MetadataReference> _references = new();

        static CodeRunnerService()
        {
            try
            {
                // Add System assemblies & interface reference
                var assemblies = new[]
                {
                    typeof(object).Assembly, // System.Private.CoreLib
                    typeof(Enumerable).Assembly, // System.Linq
                    typeof(IRobot).Assembly // CodingTycoon.Wasm
                };

                foreach (var assembly in assemblies)
                {
                    if (!string.IsNullOrEmpty(assembly.Location))
                    {
                        _references.Add(MetadataReference.CreateFromFile(assembly.Location));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MetadataReference load warning: {ex.Message}");
            }
        }

        public CompilationResult CompileAndExecute(string sourceCode, RobotInstance robot)
        {
            var result = new CompilationResult();

            if (string.IsNullOrWhiteSpace(sourceCode))
            {
                result.Success = false;
                result.Diagnostics.Add("Derlenecek C# kuralı bulunamadı.");
                return result;
            }

            try
            {
                var syntaxTree = CSharpSyntaxTree.ParseText(sourceCode);
                var assemblyName = $"UserScript_{Guid.NewGuid():N}";

                var compilationOptions = new CSharpCompilationOptions(
                    OutputKind.DynamicallyLinkedLibrary,
                    optimizationLevel: OptimizationLevel.Release,
                    allowUnsafe: false
                );

                var compilation = CSharpCompilation.Create(
                    assemblyName,
                    new[] { syntaxTree },
                    _references,
                    compilationOptions
                );

                using var ms = new MemoryStream();
                var emitResult = compilation.Emit(ms);

                if (!emitResult.Success)
                {
                    result.Success = false;
                    foreach (var diagnostic in emitResult.Diagnostics.Where(d => d.Severity == DiagnosticSeverity.Error))
                    {
                        var lineSpan = diagnostic.Location.GetLineSpan();
                        result.Diagnostics.Add($"[Satır {lineSpan.StartLinePosition.Line + 1}, Sütun {lineSpan.StartLinePosition.Character + 1}]: {diagnostic.GetMessage()}");
                    }
                    return result;
                }

                ms.Seek(0, SeekOrigin.Begin);
                var compiledAssembly = Assembly.Load(ms.ToArray());

                // Find type containing Execute method or implementing RobotScript
                var type = compiledAssembly.GetTypes()
                    .FirstOrDefault(t => t.GetMethod("Execute") != null);

                if (type == null)
                {
                    result.Success = false;
                    result.Diagnostics.Add("Yazılan C# kodunda 'Execute(IRobot robot)' metodu bulunamadı.");
                    return result;
                }

                var instance = Activator.CreateInstance(type);
                var method = type.GetMethod("Execute");

                if (method != null && instance != null)
                {
                    method.Invoke(instance, new object[] { robot });
                    result.Success = true;
                    result.Logs = robot.Logs;
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Diagnostics.Add($"Çalışma zamanı istisnası (Runtime Exception): {ex.InnerException?.Message ?? ex.Message}");
            }

            return result;
        }
    }
}
