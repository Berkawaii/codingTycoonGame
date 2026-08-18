namespace CodingTycoon.Wasm.Interfaces
{
    public enum Direction
    {
        North = 0,
        East = 1,
        South = 2,
        West = 3,
        Forward = 4
    }

    public class Tile
    {
        public int X { get; set; }
        public int Y { get; set; }
        public bool HasResource { get; set; }
        public string ResourceType { get; set; } = string.Empty;
        public int Amount { get; set; }
    }

    public interface IRobot
    {
        void Move(Direction direction);
        bool Mine();
        Tile GetTileInfo(Direction direction);
        int GetEnergy();
    }
}
