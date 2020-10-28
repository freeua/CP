using System;
using System.Reflection;
using System.Threading.Tasks;
using CoPassword.Services.App.DTOs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace CoPassword.Services.App.Controllers
{
    [Produces("application/json")]
    [Route("api/Status")]
    public class StatusController : Controller
    {
        private readonly IHostingEnvironment _environment;

        public StatusController(IHostingEnvironment environment)
        {
            this._environment = environment;
        }

        [HttpGet()]
        [Produces(typeof(StatusResponse))]

        public Task<StatusResponse> GetCurrentStatus()
        {
            var status = new StatusResponse();
            status.AssemblyInfoVersion = this.GetType().Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion;
            status.AssemblyVersion = this.GetType().Assembly.GetName().Version.ToString();
            status.AssemblyFileVersion = this.GetType().Assembly.GetCustomAttribute<AssemblyFileVersionAttribute>().Version;

            status.MachineName = Environment.MachineName;
            status.DeploymentEnvironment = this._environment?.EnvironmentName ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

            return Task.FromResult(status);
        }
    }
}