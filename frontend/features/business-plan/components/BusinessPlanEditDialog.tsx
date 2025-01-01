"use client"

import type { BusinessPlan } from "../types/BusinessPlan"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { businessPlanSchema } from "@/lib/validations/business-plan"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

interface BusinessPlanEditDialogProps {
  businessPlan: BusinessPlan
  children: React.ReactNode
  onUpdate?: () => void
}

export function BusinessPlanEditDialog({
  businessPlan,
  children,
  onUpdate,
}: BusinessPlanEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(businessPlanSchema),
    defaultValues: {
      title: businessPlan.title,
      description: businessPlan.description || "",
      start_date: businessPlan.start_date || "",
      end_date: businessPlan.end_date || "",
      status: businessPlan.status || "draft",
      context: {
        what: businessPlan.context?.what || "",
        when: businessPlan.context?.when || "",
        where: businessPlan.context?.where || "",
        who: businessPlan.context?.who || "",
        why: businessPlan.context?.why || "",
        how: businessPlan.context?.how || "",
      },
    },
  })

  async function onSubmit(values: any) {
    try {
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase
        .from("business_plans")
        .update(values)
        .eq("id", businessPlan.id)

      if (error)
        throw error

      setOpen(false)
      if (onUpdate)
        onUpdate()
    }
    catch (error) {
      console.error("Error updating business plan:", error)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ビジネスプランの編集</DialogTitle>
          <DialogDescription>
            ビジネスプランの詳細情報を編集できます。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>開始日</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>終了日</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ステータス</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="ステータスを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">下書き</SelectItem>
                      <SelectItem value="in_progress">進行中</SelectItem>
                      <SelectItem value="completed">完了</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <h3 className="font-semibold">5W1H</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="context.what"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What（何を）</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="context.when"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>When（いつ）</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="context.where"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Where（どこで）</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="context.who"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who（誰が）</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="context.why"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why（なぜ）</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="context.how"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How（どのように）</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "更新中..." : "更新する"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
