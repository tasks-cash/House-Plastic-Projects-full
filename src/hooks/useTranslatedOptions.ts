"use client";

import {
  DEBT_CATEGORIES,
  DEBT_DIRECTIONS,
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUSES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  REPORT_STATUSES,
  SALE_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  greenhouses,
  products,
  units,
} from "@/lib/constants";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

function mapEnumOptions(
  t: ReturnType<typeof useTranslations<"enums">>,
  group: string,
  values: readonly string[]
) {
  return values.map((value) => {
    const key = `${group}.${value}` as Parameters<typeof t>[0];
    try {
      return { value, label: t(key) };
    } catch {
      return { value, label: value };
    }
  });
}

export function useTranslatedOptions() {
  const t = useTranslations();
  const tEnums = useTranslations("enums");

  return useMemo(
    () => ({
      greenhouseOptions: [
        { value: "All", label: t("common.all") },
        ...greenhouses
          .filter((g) => g !== "All")
          .map((g) => ({ value: g, label: g })),
      ],
      greenhouseOptionsWithNone: [
        { value: "", label: t("common.none") },
        ...greenhouses
          .filter((g) => g !== "All")
          .map((g) => ({ value: g, label: g })),
      ],
      productOptions: products.map((p) => ({ value: p, label: p })),
      unitOptions: units.map((u) => ({ value: u, label: u })),
      saleStatusOptions: mapEnumOptions(tEnums, "saleStatus", SALE_STATUSES),
      debtCategoryOptions: mapEnumOptions(tEnums, "debtCategory", DEBT_CATEGORIES),
      debtDirectionOptions: mapEnumOptions(tEnums, "debtDirection", DEBT_DIRECTIONS),
      expenseCategoryOptions: mapEnumOptions(tEnums, "expenseCategory", EXPENSE_CATEGORIES),
      paymentMethodOptions: mapEnumOptions(tEnums, "payment", PAYMENT_METHODS),
      employeeRoleOptions: mapEnumOptions(tEnums, "employeeRole", EMPLOYEE_ROLES),
      employeeStatusOptions: mapEnumOptions(tEnums, "employeeStatus", EMPLOYEE_STATUSES),
      taskPriorityOptions: mapEnumOptions(tEnums, "taskPriority", TASK_PRIORITIES),
      taskStatusOptions: mapEnumOptions(tEnums, "taskStatus", TASK_STATUSES),
      reportStatusOptions: mapEnumOptions(tEnums, "reportStatus", REPORT_STATUSES),
    }),
    [t, tEnums]
  );
}
