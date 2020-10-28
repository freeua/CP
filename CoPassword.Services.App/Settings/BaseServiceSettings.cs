using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CoPassword.Services.App.Settings
{
    public class BaseServiceSettings
    {
        // Environment
        public string DeploymentEnvironment { get; set; }

        // Service endpoint urls
        public string ProAuthServiceUrl { get; set; }
        public string SecretManagementServiceUrl { get; set; }
        public string PkiServiceUrl { get; set; }
        public string UserManagementServiceUrl { get; set; }
        public string NotificationsServiceUrl { get; set; }
        public string AppUrl { get; set; }
    }
}
