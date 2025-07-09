import { DynamicModule, Global, InternalServerErrorException, Module, Provider } from '@nestjs/common';
import { PrivyService } from 'src/privy/privy.service';

@Global()
@Module({
  providers: [PrivyService],
  exports: [PrivyService],
})
export class PrivyModule {}