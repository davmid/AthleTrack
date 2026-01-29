using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AthleTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveNotesFromBodyMetrics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Notes",
                table: "BodyMetrics");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "BodyMetrics",
                type: "text",
                nullable: true);
        }
    }
}
