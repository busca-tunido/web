'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

type FilterState = {
  maxPrice: number;
  privateBathroom: boolean;
  mealsIncluded: boolean;
};

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({
    maxPrice: 350,
    privateBathroom: true,
    mealsIncluded: false,
  });

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">Busca TuNido</span>
            <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">
              Mobile First
            </Badge>
          </div>
          <Drawer>
            <DrawerTrigger
              render={
                <Button variant="outline" className="min-h-[48px] min-w-[48px] px-4 font-medium">
                  Filters
                </Button>
              }
            />
            <DrawerContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
              <DrawerHeader>
                <DrawerTitle>Search Filters</DrawerTitle>
                <DrawerDescription className="text-zinc-400">
                  Refine boarding house alternatives near university campuses.
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-3">
                  <span className="text-sm font-medium">Private Bathroom</span>
                  <input
                    type="checkbox"
                    checked={filters.privateBathroom}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, privateBathroom: e.target.checked }))
                    }
                    className="h-5 w-5 accent-zinc-50"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-3">
                  <span className="text-sm font-medium">Meals Included</span>
                  <input
                    type="checkbox"
                    checked={filters.mealsIncluded}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, mealsIncluded: e.target.checked }))
                    }
                    className="h-5 w-5 accent-zinc-50"
                  />
                </div>
              </div>
              <DrawerFooter>
                <DrawerClose
                  render={
                    <Button className="min-h-[48px] w-full font-semibold">Apply Filters</Button>
                  }
                />
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-20 text-center">
        <div className="mx-auto max-w-2xl flex flex-col items-center gap-4">
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-3 py-1"
          >
            Verified Student Communities
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl sm:leading-tight">
            Find Your Student Home Away From Home
          </h1>
          <p className="text-base text-zinc-400 sm:text-lg">
            A collaborative platform for relocated university students to search, compare, and
            validate student housing with clear rules and transparent costs.
          </p>
        </div>

        <div className="mt-8 w-full max-w-md">
          <Card className="border-zinc-800 bg-zinc-900/60 text-zinc-50 backdrop-blur text-left">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Featured Listing</Badge>
                <span className="text-lg font-bold text-white">$280/mo</span>
              </div>
              <CardTitle className="text-lg text-white mt-2">
                Residencia Universitaria San Juan
              </CardTitle>
              <CardDescription className="text-zinc-400">
                350m from Central Campus • Private Room
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="border-zinc-700 text-xs">
                  High-Speed WiFi
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-xs">
                  Laundry Included
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-xs">
                  Study Room
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-xs">
                  Curfew: Flexible
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="default" className="min-h-[48px] flex-1 font-semibold">
                Compare
              </Button>
              <Button variant="outline" className="min-h-[48px] flex-1">
                View Details
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </main>
  );
}
