import React from "react";
import axios from "axios";
import { useAsyncList } from "react-stately";
import { useQuery } from "@tanstack/react-query";
import { Spinner, Button, Table, TableHeader, TableRow, TableBody, TableCell, TableColumn } from "@heroui/react";

import { DefaultLayout } from "@components";

export default function Home() {
  return (
    <DefaultLayout>
      <div className="space-y-4">
        <p className="text-2xl font-bold text-center">
          React + Vite + TailwindCSS + HeroUI
        </p>
      </div>
      <MockUsers />
    </DefaultLayout>
  );
}

function MockUsers() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: () => axios.get("https://jsonplaceholder.typicode.com/users").then((res) => res.data),
  });

  const list = useAsyncList({
    async load() {
      return {
        items: data || []
      }
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a: any, b: any) => {
          let first = a[sortDescriptor.column];
          let second = b[sortDescriptor.column];
          let cmp = (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

          if (sortDescriptor.direction === "descending") {
            cmp *= -1;
          }

          return cmp;
        }),
      };
    },
  });

  React.useEffect(() => {
    list.reload();
  }, [data])

  return (
    <div className="w-full h-full flex flex-col items-center justify-start space-y-4">
      <Table
        aria-label="Mock Users"
        classNames={{
          table: "min-h-[400px] min-w-[600px]",
        }}
        sortDescriptor={list.sortDescriptor}
        onSortChange={list.sort}
      >
        <TableHeader>
          <TableColumn> No. </TableColumn>
          <TableColumn> Id </TableColumn>
          <TableColumn key="name" allowsSorting> Name </TableColumn>
          <TableColumn key="username" allowsSorting> Username </TableColumn>
          <TableColumn key="email" allowsSorting> Email </TableColumn>
          <TableColumn key="phone" allowsSorting> Phone </TableColumn>
          <TableColumn key="website" allowsSorting> Website </TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {list.items.map((user: any, i: number) => (
            <TableRow key={user.id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.website}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onPress={() => list.reload()} color="primary" size="md" className="self-end">
        Refresh
      </Button>
    </div>
  )
}