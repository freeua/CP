import { Injectable } from '@angular/core';
import { EditableVault } from '../entities/editableVault';
import { CacheControlService } from './cache-control.service';
import { VaultDto } from '@copassword/copassword.clients.secretmanagement';
import { ClientVaultService } from './client-vault.service';

@Injectable()
export class VaultService {

  constructor(
    private readonly _cacheService: CacheControlService,
    private readonly _clientVaultServiceClient: ClientVaultService
  ) { }

  /**
   * Check vault in cache if not exist when call decryptVault
   */
  public async checkDecryptedVault(editableVault: EditableVault): Promise<EditableVault> {

    const result = this._cacheService.getVaultFromCache(editableVault.id);

    return new Promise<EditableVault>((resolve, reject) => {
      if (result) {
        resolve(result);
      } else {
        this.decryptVault(editableVault.encryptedVault)
          .then(vault => {
            this._cacheService.addVaultToCache(vault);
            resolve(vault);
          })
          .catch(error => {
            reject(error)
          });
      }
    });

  }

  /**
   * Decrypt vault
   */
  private async decryptVault(vault: VaultDto): Promise<any> {
    return await this._clientVaultServiceClient.decrypt(vault);
  }


}

