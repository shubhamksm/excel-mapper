import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database";
import { DataTable } from "@/containers/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Account, AccountType, AccountSubType } from "@/types";
import { formatCurrency } from "@/utils";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const columns: ColumnDef<Account>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Type",
    accessorKey: "subType",
  },
  {
    header: "Currency",
    accessorKey: "currency",
  },
  {
    header: "Balance",
    accessorKey: "balance",
    cell: ({ row }) =>
      formatCurrency(row.original.currency, row.original.balance),
  },
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  currency: z.string().min(1, "Currency is required"),
  type: z.nativeEnum(AccountType),
  subType: z.nativeEnum(AccountSubType),
  balance: z.number().min(0),
  parentAccountId: z.string().optional(),
});

export const Accounts = () => {
  const accounts = useLiveQuery(() => db.accounts.toArray());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      currency: "",
      type: AccountType.MAIN,
      subType: AccountSubType.SAVINGS,
      balance: 0,
      parentAccountId: undefined,
    },
  });
  const isProxy = form.watch("type") === AccountType.PROXY;
  const parentAccountId = form.watch("parentAccountId");

  const handleProxyToggle = (checked: boolean) => {
    form.setValue("type", checked ? AccountType.PROXY : AccountType.MAIN);
    if (!checked) {
      form.setValue("parentAccountId", undefined);
    }
  };

  const [open, setOpen] = useState(false);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const newAccount: Account = {
      id: uuidv4(),
      ...values,
    };
    await db.accounts.add(newAccount);
    form.reset();
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add Account</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new account
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter account name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input placeholder="EUR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2">
                  <Switch
                    id="proxy-mode"
                    checked={isProxy}
                    onCheckedChange={handleProxyToggle}
                  />
                  <FormLabel htmlFor="proxy-mode">Make Proxy Account</FormLabel>
                </div>

                {isProxy && (
                  <FormField
                    control={form.control}
                    name="parentAccountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link with Parent Account</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select parent account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accounts
                              ?.filter((acc) => acc.type === AccountType.MAIN)
                              .map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="subType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(AccountSubType).map((subType) => (
                            <SelectItem key={subType} value={subType}>
                              {subType}
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
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Initial Balance
                        <FormDescription>
                          (can be adjusted later)
                        </FormDescription>
                      </FormLabel>
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
                  <Button type="submit" disabled={isProxy && !parentAccountId}>
                    Save Account
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={accounts || []} />
    </div>
  );
};
