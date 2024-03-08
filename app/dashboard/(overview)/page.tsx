import { Suspense } from 'react';
import CardWrapper, { Card } from '../../ui/dashboard/cards';
import LatestInvoices from '../../ui/dashboard/latest-invoices';
import RevenueChart from '../../ui/dashboard/revenue-chart';
import { lusitana } from '../../ui/fonts';
import { CardsSkeleton, LatestInvoicesSkeleton, RevenueChartSkeleton } from '@/app/ui/skeletons';

export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton></CardsSkeleton>}>
          <CardWrapper></CardWrapper>
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton></RevenueChartSkeleton>}>
          <RevenueChart/>
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton></LatestInvoicesSkeleton>}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}
