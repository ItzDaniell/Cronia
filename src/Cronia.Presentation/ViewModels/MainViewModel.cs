using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Cronia.Presentation.ViewModels;

public partial class MainViewModel : ObservableObject
{
    [ObservableProperty]
    private string _title = "Cronia - Personal Productivity";

    [ObservableProperty]
    private string _statusMessage = "Listo y funcionando offline en .NET 10";

    [RelayCommand]
    private void UpdateStatus()
    {
        StatusMessage = $"Actualizado a las {DateTime.Now:T}";
    }
}
