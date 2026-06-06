"use client";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import type { Course } from "@mw/types";
import { DataTable } from "./DataTable";
import { PublishToggle } from "./PublishToggle";
import { upsertCourseAction } from "@/app/actions/courses.actions";

const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link href={`/courses/${row.original.id}`} className="font-medium text-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
        {row.original.title}
      </Link>
    ),
  },
  { accessorKey: "level", header: "Level" },
  { accessorKey: "slug", header: "Slug" },
  {
    accessorKey: "published",
    header: "Published",
    cell: ({ row }) => (
      <PublishToggle
        id={row.original.id}
        published={row.original.published}
        onToggle={async (id, published) =>
          upsertCourseAction({ ...row.original, id, published })
        }
      />
    ),
  },
];

export function CoursesTable({ courses }: { courses: Course[] }) {
  return <DataTable data={courses} columns={columns} searchPlaceholder="Search courses…" />;
}
