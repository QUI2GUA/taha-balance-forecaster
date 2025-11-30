// components/AddTransactionModal.tsx
'use client'

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { createTransaction } from '@/app/actions';

// Schema without past date restriction
const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  amount: z.coerce.number().min(0.01, "Please enter a valid amount."),
  type: z.enum(["INCOME", "EXPENSE"], { required_error: "Please select a transaction type." }),
  startDate: z.date({ required_error: "A date is required." }),
  recurrence: z.enum([
    "ONE_TIME", "WEEKLY", "BI_WEEKLY", "MONTHLY", 
    "BI_MONTHLY", "QUARTERLY", "ANNUALLY"
  ]),
});

// Props to accept a default date and control open state via children
interface AddTransactionModalProps {
  defaultDate?: Date;
  children: React.ReactNode;
}

export function AddTransactionModal({ defaultDate, children }: AddTransactionModalProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: 0,
      type: "EXPENSE",
      recurrence: "MONTHLY",
      startDate: defaultDate || new Date(),
    },
  });

  // Reset form values when the dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        amount: 0,
        type: "EXPENSE",
        recurrence: "MONTHLY",
        startDate: defaultDate || new Date(),
      });
    }
  }, [open, defaultDate, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await createTransaction(values);

    if (result.success) {
      toast.success("Transaction added successfully!");
      setOpen(false);
    } else {
      toast.error(result.error || "Something went wrong.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a New Transaction</DialogTitle>
          <DialogDescription>
            Enter the details of your income or expense.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <ToggleGroup 
                        type="single" 
                        value={field.value} 
                        onValueChange={field.onChange}
                        className="grid grid-cols-2"
                    >
                      <ToggleGroupItem value="INCOME" aria-label="Set as income">Income</ToggleGroupItem>
                      <ToggleGroupItem value="EXPENSE" aria-label="Set as expense">Expense</TogglseGroupItem>
                    </ToggleGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Paycheck, Rent, Netflix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">$</span>
                            <Input type="number" step="0.01" placeholder="0.00" className="pl-7" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="recurrence"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurrence</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="ONE_TIME">One Time</SelectItem>
                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                                <SelectItem value="BI_WEEKLY">Bi-Weekly</SelectItem>
                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                <SelectItem value="ANNUALLY">Annually</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                  )}
                />
            </div>

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                              >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                          />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? "Saving..." : "Add Transaction"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
