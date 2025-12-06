import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../merchant.entity';

@Injectable()
export class KeyGenerationProvider {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  /**
   * Generate a unique 6-digit API key
   */
  async generateApiKey(): Promise<string> {
    let apiKey: string;
    let isUnique = false;

    while (!isUnique) {
      // Generate 6-digit number
      apiKey = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Check if it's unique
      const existingMerchant = await this.merchantRepository.findOne({
        where: { apiKey }
      });
      
      if (!existingMerchant) {
        isUnique = true;
      }
    }

    return apiKey;
  }

  /**
   * Generate a unique 15-character secret key
   * Format: ABC123456789012DE (3 letters + 10 numbers + 2 letters)
   */
  async generateSecretKey(): Promise<string> {
    let secretKey: string;
    let isUnique = false;

    while (!isUnique) {
      // Generate first 3 letters
      const firstThreeLetters = this.generateRandomLetters(3);
      
      // Generate 10 numbers
      const tenNumbers = this.generateRandomNumbers(10);
      
      // Generate last 2 letters
      const lastTwoLetters = this.generateRandomLetters(2);
      
      secretKey = firstThreeLetters + tenNumbers + lastTwoLetters;
      
      // Check if it's unique
      const existingMerchant = await this.merchantRepository.findOne({
        where: { secretKey }
      });
      
      if (!existingMerchant) {
        isUnique = true;
      }
    }

    return secretKey;
  }

  /**
   * Generate random letters
   */
  private generateRandomLetters(length: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    return result;
  }

  /**
   * Generate random numbers
   */
  private generateRandomNumbers(length: number): string {
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    
    return result;
  }
}