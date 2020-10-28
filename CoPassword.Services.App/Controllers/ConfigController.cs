using System;
using CoPassword.Services.App.Settings;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace CoPassword.Services.App.Controllers
{
    [Route("api/[controller]")]
    public class ConfigController : Controller
    {
        private readonly BaseServiceSettings baseServiceSettings;
        private readonly IConfiguration configuration;

        public ConfigController(IOptions<BaseServiceSettings> baseServiceSettings, IConfiguration configuration)
        {
            this.baseServiceSettings = baseServiceSettings?.Value ?? throw new ArgumentNullException(nameof(baseServiceSettings));
            this.configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        // GET api/config/env.js
        [HttpGet("env.js")]
        public ContentResult GetBaseServiceSettingsScript()
        {
            var data = @"(function (window){{
                            window.copasswordenv = window.copasswordenv || {{}};
                            window.copasswordenv['deploymentEnvironment'] = '{0}'
                            window.copasswordenv['proAuthServiceUrl'] = '{1}';
                            window.copasswordenv['secretManagementServiceUrl'] = '{2}';
                            window.copasswordenv['pkiServiceUrl'] = '{3}';
                            window.copasswordenv['userManagementServiceUrl'] = '{4}';
                            window.copasswordenv['notificationsServiceUrl'] = '{5}';
                            window.copasswordenv['appUrl'] = '{6}';
                            window.copasswordenv['reCaptchaSiteKey'] = '{7}';
                         }}(this));";

            var script = string.Format(
                data,
                baseServiceSettings.DeploymentEnvironment,
                baseServiceSettings.ProAuthServiceUrl,
                baseServiceSettings.SecretManagementServiceUrl,
                baseServiceSettings.PkiServiceUrl,
                baseServiceSettings.UserManagementServiceUrl,
                baseServiceSettings.NotificationsServiceUrl,
                baseServiceSettings.AppUrl,
                configuration["ReCaptcha:SiteKey"]);

            return new ContentResult
            {
                Content = script,
                ContentType = "application/javascript"
            };
        }
    }
}