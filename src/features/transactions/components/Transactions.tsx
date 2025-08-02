import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database";
import { DataTable } from "@/containers/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Transaction, Category_Type, Account } from "@/types";
import { formatCurrency, toTitleCase } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useMemo } from "react";
import { transactionProcessor } from "@/utils/processTransactions";
import { CATEGORY_LIST } from "@/constants";
import { ExcelImportModal } from "@/features/import/components/ExcelImportModal";
import { ArrowUpDown, Edit } from "lucide-react";
import { CategoryChangeDialog } from "./CategoryChangeDialog";
import { TransactionFilters } from "./filters/TransactionFilters";
import { useTransactionFilters } from "../hooks/useTransactionFilters";
import { filterTransactions, getFilterSummary } from "../utils/filterUtils";

// Define columns factory function to access accounts data
const createColumns = (
  accounts: Account[] = [],
  setCategoryChangeDialog?: (dialog: {
    open: boolean;
    transaction: Transaction | null;
  }) => void
): ColumnDef<Transaction>[] => [
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "date",
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  {
    header: "Title",
    accessorKey: "title",
  },
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "amount",
    cell: ({ row }) =>
      formatCurrency(row.original.currency, row.original.amount),
  },
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Account
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "accountId",
    cell: ({ row }) => {
      const account = accounts.find((acc) => acc.id === row.original.accountId);
      return (
        <span className="font-medium">
          {account?.name || "Unknown Account"}
        </span>
      );
    },
  },
  {
    header: "Category",
    accessorKey: "category",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span>{toTitleCase(row.original.category)}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            setCategoryChangeDialog?.({
              open: true,
              transaction: row.original,
            });
          }}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    ),
  },
  {
    header: "Note",
    accessorKey: "note",
  },
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.date(),
  category: z.enum(CATEGORY_LIST as unknown as [string, ...string[]]),
  note: z.string().optional(),
  accountId: z.string().min(1, "Account is required"),
  referenceAccountId: z.string().optional(),
  referenceAmount: z.number().optional(),
});

export const Transactions = () => {
  const transactions = useLiveQuery(() => db.transactions.toArray());
  const accounts = useLiveQuery(() => db.accounts.toArray());
  const [open, setOpen] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [categoryChangeDialog, setCategoryChangeDialog] = useState<{
    open: boolean;
    transaction: Transaction | null;
  }>({ open: false, transaction: null });

  const filterState = useTransactionFilters();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: 0,
      date: new Date(),
      category: "EXTRAS" as Category_Type,
      note: "",
      accountId: "",
    },
  });

  // Filter transactions using the new filter system
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return filterTransactions(transactions, filterState);
  }, [transactions, filterState]);

  // Get the primary currency from accounts (for display purposes)
  const primaryCurrency = useMemo(() => {
    return accounts?.[0]?.currency || "NOK";
  }, [accounts]);

  // Create columns with account data and category change functionality
  const tableColumns = useMemo(() => {
    return createColumns(accounts || [], setCategoryChangeDialog);
  }, [accounts, setCategoryChangeDialog]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await transactionProcessor.processAndSaveTransactions(values.accountId, [
      {
        ...values,
        category: values.category as Category_Type,
        year: values.date.getFullYear(),
        currency:
          accounts?.find((account) => account.id === values.accountId)
            ?.currency || "NOK",
      },
    ]);
    form.reset();
    setOpen(false);
  };

  const handleCategoryChanged = () => {
    // The transactions will automatically update due to useLiveQuery
    // This function can be used for any additional actions after category change
  };

  return (
    <div className="flex flex-col gap-y-4">
      {/* Filter Controls */}
      <TransactionFilters
        filterState={filterState}
        currency={primaryCurrency}
        isCollapsed={isFiltersCollapsed}
        onToggleCollapse={setIsFiltersCollapsed}
      />

      <div className="flex justify-between items-center gap-x-2">
        {/* Action Buttons */}
        <div className="flex gap-x-2 ml-auto">
          <ExcelImportModal />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Add Transaction</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new transaction
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Transaction title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accounts?.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name} ({account.currency})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value.toISOString().split("T")[0]}
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORY_LIST.map((category) => (
                              <SelectItem key={category} value={category}>
                                {toTitleCase(category)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note</FormLabel>
                        <FormControl>
                          <Input placeholder="Add a note" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        form.reset();
                        setOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Transaction</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Results Info */}
      {filterState.hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          {getFilterSummary(
            filterState,
            transactions?.length || 0,
            filteredTransactions.length
          )}
        </div>
      )}

      <DataTable columns={tableColumns} data={filteredTransactions || []} />

      {/* Category Change Dialog */}
      <CategoryChangeDialog
        transaction={categoryChangeDialog.transaction}
        open={categoryChangeDialog.open}
        onOpenChange={(open) =>
          setCategoryChangeDialog({ open, transaction: null })
        }
        onCategoryChanged={handleCategoryChanged}
      />
    </div>
  );
};
