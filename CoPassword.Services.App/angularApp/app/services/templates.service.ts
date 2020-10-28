import { Injectable } from '@angular/core';
import {
    ISecretManagementServiceClient,
    SecretManagementServiceClient, VaultTemplateDto
} from '@copassword/copassword.clients.secretmanagement';

@Injectable()
export class TemplatesService {

    private secretManagementServiceClient: ISecretManagementServiceClient;

    constructor(
        secretManagementServiceClient: SecretManagementServiceClient,
    ) {
        this.secretManagementServiceClient = secretManagementServiceClient;
    }

  /**
   * Get templates
   */
    public async getTemplates (): Promise<VaultTemplateDto[]> {
        return await this.secretManagementServiceClient.getVaultTemplates().toPromise();
    }

  /**
   * Create template
   */
    public async postTemplate (value: VaultTemplateDto): Promise<VaultTemplateDto> {
        return await this.secretManagementServiceClient.createVaultTemplate(value).toPromise();
    }

  /**
   * Update template
   */
    public async putTemplate (id: string, value: VaultTemplateDto): Promise<VaultTemplateDto> {
        return await this.secretManagementServiceClient.updateVaultTemplate(id, value).toPromise();
    }

  /**
   * Delete template
   */
    public async deleteTemplate (id: string): Promise<VaultTemplateDto> {
        return await this.secretManagementServiceClient.deleteVaultTemplate(id).toPromise();
    }
}