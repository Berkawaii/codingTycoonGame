using System;
using System.Text.Json;
using Microsoft.JSInterop;
using CodingTycoon.Wasm.Services;

namespace CodingTycoon.Wasm
{
    public static class JSBridge
    {
        private static readonly CodeRunnerService _runner = new();

        [JSInvokable("CompileAndExecute")]
        public static string CompileAndExecute(string sourceCode, string robotJson)
        {
            try
            {
                var robot = new RobotInstance();
                if (!string.IsNullOrEmpty(robotJson))
                {
                    try
                    {
                        var parsed = JsonSerializer.Deserialize<RobotInstance>(robotJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (parsed != null)
                        {
                            robot.X = parsed.X;
                            robot.Y = parsed.Y;
                            robot.CurrentDirection = parsed.CurrentDirection;
                            robot.Energy = parsed.Energy;
                        }
                    }
                    catch { }
                }

                var compilationResult = _runner.CompileAndExecute(sourceCode, robot);
                return JsonSerializer.Serialize(compilationResult, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
            }
            catch (Exception ex)
            {
                var errorResult = new CompilationResult
                {
                    Success = false,
                    Diagnostics = new System.Collections.Generic.List<string> { ex.Message }
                };
                return JsonSerializer.Serialize(errorResult);
            }
        }
    }
}
