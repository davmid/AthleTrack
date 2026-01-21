using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AthleTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class MakeDurationNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Reps",
                table: "Workouts",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WeightKg",
                table: "Workouts",
                type: "numeric(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Reps",
                table: "Workouts");

            migrationBuilder.DropColumn(
                name: "WeightKg",
                table: "Workouts");
        }
    }
}
