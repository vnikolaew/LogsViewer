﻿using System.ComponentModel.DataAnnotations;

namespace LogViewer.Services.Parsing;

public interface ILogConfiguration
{
    public string ServiceName { get; set; }
    
    public string LogFormat { get; }
}

public class LogConfiguration : ILogConfiguration
{
    [Required(ErrorMessage = "Service name is required.")]
    public string ServiceName { get; set; }
    
    [Required(ErrorMessage = "Log format is required.")]
    public string LogFormat { get; set;  }
}