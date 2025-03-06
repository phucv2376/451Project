using BudgetAppBackend.Application.Models;

namespace BudgetAppBackend.Application.DTOs.PagingsDTOs
{
    public class PagedResponse<T>
    {
        public PagingDetails Paging { get; set; }
        public List<T> Data { get; set; }

        public PagedResponse(IQueryable<T> queryable, PagingDTO pagingdDto)
        {
            Paging = new PagingDetails
            {
                TotalRows = queryable.Count()
            };
            Paging.TotalPages = (int)Math.Ceiling((double)Paging.TotalRows / pagingdDto.rowCount);
            Paging.CurPage = pagingdDto.pagNumber;
            Paging.HasNextPage = Paging.CurPage < Paging.TotalPages;
            Paging.HasPrevPage = Paging.CurPage > 1;

            Data = queryable.Skip((pagingdDto.pagNumber - 1) * pagingdDto.rowCount)
                 .Take(pagingdDto.rowCount).ToList();
        }
    }
}
