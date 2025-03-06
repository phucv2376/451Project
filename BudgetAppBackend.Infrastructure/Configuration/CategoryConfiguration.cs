using BudgetAppBackend.Domain.CategoryAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BudgetAppBackend.Infrastructure.Configuration
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {

            builder.HasKey(c => c.Id);
            builder.Property(c => c.Id)
                .HasConversion(
                    id => id.Id,
                    value => CategoryId.Create(value)
                )
                .ValueGeneratedNever();

            builder.Property(c => c.Name)
               .IsRequired()
               .HasMaxLength(100)
               .HasColumnType("varchar(100)");

            builder.HasIndex(c => c.Name)
                .IsUnique();

            builder.ToTable("Categories");
        }
    }
}
