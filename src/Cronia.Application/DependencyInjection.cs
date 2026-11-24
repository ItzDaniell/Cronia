using Microsoft.Extensions.DependencyInjection;

namespace Cronia.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Application layer registrations (validators, application services)
        return services;
    }
}
