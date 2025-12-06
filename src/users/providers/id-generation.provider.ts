import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleValidatorProvider } from 'src/auth/providers/role-validator.provider';
import { UserRole } from 'src/common/enums/app.enums';
import { User } from '../user.entity';

@Injectable()
export class IdGenerationProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly roleValidator: RoleValidatorProvider,
  ) {}

  /**
   * Generate next available ID for the given role - Simple approach
   */
  async generateNextId(role: UserRole): Promise<number> {
    try {
    //   console.log(`Generating ID for role: ${role}`);
      
      const startingNumber = this.roleValidator.getRoleStartingNumber(role);
    //   console.log(`Starting number for ${role}: ${startingNumber}`);

      // Get all users and find max ID for this role type
      const allUsers = await this.usersRepository.find({
        select: ['id'],
        order: { id: 'DESC' }
      });

    //   console.log(`Total users in database: ${allUsers.length}`);

      if (allUsers.length === 0) {
        console.log(`No users found, returning starting number: ${startingNumber}`);
        return startingNumber;
      }

      // Filter users by role based on ID pattern
      let roleUsers: User[] = [];
      
      switch (role) {
        case UserRole.SUPERADMIN:
          roleUsers = allUsers.filter(user => {
            const idStr = user.id.toString();
            return idStr.startsWith('44') && idStr.length >= 6;
          });
          break;
          
        case UserRole.ADMIN:
          roleUsers = allUsers.filter(user => {
            const idStr = user.id.toString();
            return idStr.startsWith('14') && idStr.length >= 6;
          });
          break;
          
        case UserRole.STAFF:
          roleUsers = allUsers.filter(user => {
            const idStr = user.id.toString();
            return idStr.startsWith('15') && idStr.length >= 6;
          });
          break;
          
        case UserRole.USER:
          roleUsers = allUsers.filter(user => {
            const idStr = user.id.toString();
            // Users have IDs that don't start with 44, 14, or 15
            return !idStr.startsWith('44') && !idStr.startsWith('14') && !idStr.startsWith('15');
          });
          break;
          
        default:
          throw new Error(`Unsupported role: ${role}`);
      }

    //   console.log(`Found ${roleUsers.length} existing users for role ${role}`);

      if (roleUsers.length === 0) {
        console.log(`No existing users for role ${role}, returning starting number: ${startingNumber}`);
        return startingNumber;
      }

      // Find the highest ID
      const maxId = Math.max(...roleUsers.map(user => user.id));
      const nextId = maxId + 1;
      
    //   console.log(`Max existing ID for role ${role}: ${maxId}, next ID: ${nextId}`);
      
      return nextId;
      
    } catch (error) {
      console.error('Error in generateNextId:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }
}