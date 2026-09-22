"use client";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { useDeleteAccountModal } from "@/components/modals/delete-account-modal";
import { Icons } from "@/components/shared/icons";

export function DeleteAccountSection() {
  const { setShowDeleteAccountModal, DeleteAccountModal } =
    useDeleteAccountModal();

  const userPaidPlan = true;

  return (
    <>
      <DeleteAccountModal />

      <SectionColumns
        title="Delete Account"
        description="Permanently remove your account and associated data."
      >
        <div className="flex flex-col gap-5 rounded-xl border border-red-500/20 bg-red-500/[0.03] p-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-white">
                Delete your account
              </span>

              {userPaidPlan ? (
                <div className="flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                  <div className="flex items-center justify-center rounded-full bg-red-500/20 p-1">
                    <Icons.close
                      size={9}
                      className="text-red-400"
                    />
                  </div>
                  Active Subscription
                </div>
              ) : null}
            </div>

            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              Permanently delete your {siteConfig.name} account
              {userPaidPlan ? " and your subscription" : ""}. This action
              cannot be undone. Please make sure you want to continue.
            </p>
          </div>

          <div className="flex items-center">
            <Button
              type="button"
              variant="destructive"
              className="bg-red-600 text-white hover:bg-red-500"
              onClick={() => setShowDeleteAccountModal(true)}
            >
              <Icons.trash className="mr-2 size-4" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>
      </SectionColumns>
    </>
  );
}
