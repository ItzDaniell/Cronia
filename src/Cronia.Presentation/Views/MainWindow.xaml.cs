using System.Windows;
using Cronia.Presentation.ViewModels;

namespace Cronia.Presentation.Views;

public partial class MainWindow : Window
{
    public MainWindow(MainViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
    }
}
