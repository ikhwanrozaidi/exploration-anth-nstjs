import { Module } from '@nestjs/common';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './providers/audit-log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditTrail } from './entity/audit-trail.entity';

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService],
  imports:[
    TypeOrmModule.forFeature([AuditLog, AuditTrail ]),
  ]
})
export class AuditLogModule {}
