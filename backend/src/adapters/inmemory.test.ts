import { describe } from 'vitest';
import {
  InMemoryArticleRepository,
  InMemoryBookRepository,
  InMemoryEbookRepository,
  InMemoryCourseRepository,
  InMemoryFreebieRepository,
  InMemoryOrderRepository,
  InMemoryContactRepository,
  InMemorySiteConfigRepository,
  InMemoryStartHereRepository,
  InMemoryAuditLogRepository,
  InMemoryAuthGateway,
  InMemoryStorageGateway,
} from './inmemory';
import {
  runArticleRepositoryContractTests,
  runBookRepositoryContractTests,
  runEbookRepositoryContractTests,
  runCourseRepositoryContractTests,
  runFreebieRepositoryContractTests,
  runOrderRepositoryContractTests,
  runContactRepositoryContractTests,
  runSiteConfigRepositoryContractTests,
  runStartHereRepositoryContractTests,
  runAuditLogRepositoryContractTests,
  runAuthGatewayContractTests,
  runStorageGatewayContractTests,
} from '../domain/ports/contracts';

describe('InMemory Adapter Contract Verification', () => {
  runArticleRepositoryContractTests(async () => new InMemoryArticleRepository());
  runBookRepositoryContractTests(async () => new InMemoryBookRepository());
  runEbookRepositoryContractTests(async () => new InMemoryEbookRepository());
  runCourseRepositoryContractTests(async () => new InMemoryCourseRepository());
  runFreebieRepositoryContractTests(async () => new InMemoryFreebieRepository());
  runOrderRepositoryContractTests(async () => new InMemoryOrderRepository());
  runContactRepositoryContractTests(async () => new InMemoryContactRepository());
  runSiteConfigRepositoryContractTests(async () => new InMemorySiteConfigRepository());
  runStartHereRepositoryContractTests(async () => new InMemoryStartHereRepository());
  runAuditLogRepositoryContractTests(async () => new InMemoryAuditLogRepository());
  
  runAuthGatewayContractTests(async (initialOps) => new InMemoryAuthGateway(initialOps));
  runStorageGatewayContractTests(async () => new InMemoryStorageGateway());
});
