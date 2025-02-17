using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetAppBackend.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProtectedController : ControllerBase
    {
        private static readonly List<Product> _products = new List<Product> // Fix IDE0028
        {
            new Product { Id = 1, Name = "Laptop", Price = 1200 },
            new Product { Id = 2, Name = "Headphones", Price = 150 },
        };

        [HttpGet]
        public IActionResult GetProducts()
        {
            return Ok(_products);
        }
    }

    // Define the Product class to fix CS0246
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
    }
}
