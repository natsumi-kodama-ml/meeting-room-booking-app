"use client";

import { useState } from "react";
import { User } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCurrentUser } from "@/components/current-user-provider";

export function CurrentUserControl({ size = "sm" }: { size?: "sm" | "default" }) {
  const { myName, setMyName } = useCurrentUser();
  const [draft, setDraft] = useState(myName);

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) setDraft(myName);
      }}
    >
      <PopoverTrigger
        render={<Button variant="outline" size={size} className="gap-1.5" />}
      >
        <User className="size-3.5" />
        {myName || "自分の名前を設定"}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="flex flex-col gap-2 p-1">
          <Label htmlFor="my-name">自分の名前</Label>
          <Input
            id="my-name"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="例: 田中 太郎"
          />
          <p className="text-xs text-muted-foreground">
            自分が予約者・参加メンバーになっている予定がハイライトされます
          </p>
          <Button size="sm" className="mt-1" onClick={() => setMyName(draft.trim())}>
            保存
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
