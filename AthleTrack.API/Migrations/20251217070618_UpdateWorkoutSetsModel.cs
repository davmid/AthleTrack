using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AthleTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWorkoutSetsModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSets_Workouts_WorkoutId",
                table: "WorkoutSets");

            migrationBuilder.AlterColumn<int>(
                name: "WorkoutId",
                table: "WorkoutSets",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSets_Workouts_WorkoutId",
                table: "WorkoutSets",
                column: "WorkoutId",
                principalTable: "Workouts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSets_Workouts_WorkoutId",
                table: "WorkoutSets");

            migrationBuilder.AlterColumn<int>(
                name: "WorkoutId",
                table: "WorkoutSets",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSets_Workouts_WorkoutId",
                table: "WorkoutSets",
                column: "WorkoutId",
                principalTable: "Workouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
