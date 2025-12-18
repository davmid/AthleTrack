using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AthleTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class AddInitialExercises : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Exercises",
                columns: new[] { "Id", "IsCardio", "MuscleGroup", "Name", "UserId" },
                values: new object[,]
                {
                    { 1, false, "Klatka", "Wyciskanie na ławce", null },
                    { 2, false, "Nogi", "Przysiad ze sztangą", null },
                    { 3, false, "Plecy", "Martwy ciąg", null },
                    { 4, true, "Cardio", "Bieg na bieżni", null },
                    { 5, false, "Biceps", "Uginanie ramion ze sztangą", null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: 5);
        }
    }
}
