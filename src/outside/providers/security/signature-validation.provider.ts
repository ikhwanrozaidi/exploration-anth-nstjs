import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PaymentRequestDto } from '../../dtos/payment-request.dto';

@Injectable()
export class SignatureValidationProvider {
  /**
   * Validate SHA256 signature
   */
validateSignature(paymentRequest: PaymentRequestDto, merchantSecretKey: string): boolean {
  console.log('SignatureValidationProvider: Validating signature');

  try {
    // Step 1: Create payload without signature
    const payloadWithoutSignature = { ...paymentRequest };
    delete payloadWithoutSignature.signature;

    // Step 2: Sort keys alphabetically for consistent hashing
    const sortedKeys = Object.keys(payloadWithoutSignature).sort();
    
    // Step 3: Create string to hash
    let stringToHash = '';
    for (const key of sortedKeys) {
      const value = payloadWithoutSignature[key];
      if (value !== undefined && value !== null && value !== '') {
        stringToHash += `${key}=${value}&`;
      }
    }
    
    // Step 4: Remove the trailing '&' and DON'T append secret
    stringToHash = stringToHash.slice(0, -1); // Remove last '&'
    
    console.log('String to hash:', stringToHash);

    // Step 5: Generate SHA256 hash
    const generatedSignature = createHash('sha256')
      .update(stringToHash)
      .digest('hex');

    console.log('Generated signature:', generatedSignature);
    console.log('Provided signature:', paymentRequest.signature);

    // Step 6: Compare signatures
    const isValid = generatedSignature === paymentRequest.signature;
    
    if (!isValid) {
      console.log('Signature validation failed');
      throw new UnauthorizedException('Access denied');
    }

    console.log('Signature validation successful');
    return true;

  } catch (error) {
    console.error('Error validating signature:', error);
    throw new UnauthorizedException('Access denied');
  }
}
}