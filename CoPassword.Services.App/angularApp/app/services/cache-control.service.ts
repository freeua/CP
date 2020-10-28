import { Injectable } from '@angular/core';
import { EditableVault } from '../entities/editableVault';

export interface ICacheControlService {
  getVaultFromCache(id?: string): any;
  addVaultToCache(vault: EditableVault): any;
  removeVaultFromCache(id: string): any;
}

@Injectable()
export class CacheControlService implements ICacheControlService {

  public cache = [];
  public staticElem: any;

  /**
   * Get cache
   */
  public getVaultFromCache (id?: string): any {

    let result;

    if (id) {
      result = this.cache.find(vault => vault.id === id);
    } else {
      result = this.cache;
    }

    return result;

  }

  /**
   * Add / Update vault cache
   */
  public addVaultToCache (vault: EditableVault): any {

    let getVault = this.cache.find(data => data.id === vault.id);

    if (getVault !== undefined) {
      getVault = vault;
    } else {
      this.cache.push(vault);
    }

    return this.getVaultFromCache();

  }

  /**
   * Change Visible Popup
   */
  public removeVaultFromCache (id: string): any {
    let index: number;

    const existVault = this.cache.find((data, i) => {
      index = i;
      return data.id === id;
    });

    if (existVault) {
      this.cache.splice(index, 1);
    }

    return this.getVaultFromCache();
  }

}