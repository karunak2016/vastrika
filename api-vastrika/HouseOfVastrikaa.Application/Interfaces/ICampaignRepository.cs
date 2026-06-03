using HouseOfVastrikaa.Domain.Entities;

namespace HouseOfVastrikaa.Application.Interfaces;

public interface ICampaignRepository
{
    Task<List<Campaign>> GetAllAsync();
    Task<List<Campaign>> GetActiveCampaignsAsync();
    Task<int> CreateAsync(Campaign campaign);
    Task UpdateAsync(Campaign campaign);
}
