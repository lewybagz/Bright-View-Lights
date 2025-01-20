import { useState } from "react";
import { Search } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCustomers } from "@/hooks/use-customers";
import type { Customer } from "@/types";

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
}

export function CustomerList({ customers, onEdit, onView }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { ref, inView } = useInView();

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useCustomers();

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact.phone.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load more when the last item is in view
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const customer = filteredCustomers[index];
    if (!customer) return null;

    return (
      <div style={style} className="border-b">
        <div className="flex items-center p-4">
          <div className="flex-1">
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-muted-foreground">
              {customer.contact.email} • {customer.contact.phone}
            </div>
            <div className="text-sm text-muted-foreground">
              {customer.address}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(customer)}
            >
              View
            </Button>
            <Button size="sm" onClick={() => onEdit(customer)}>
              Edit
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-md border" style={{ height: "400px" }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={filteredCustomers.length}
              itemSize={88}
            >
              {Row}
            </List>
          )}
        </AutoSizer>

        <div ref={ref} className="h-4" />
      </div>
    </div>
  );
}
