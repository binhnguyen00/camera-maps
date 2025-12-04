import React from "react";
import axios from "axios";

import { describe, it, expect } from "vitest";
import { render, waitFor, screen } from "@testing-library/react";
import { useAsyncList } from "react-stately";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeroUIProvider, Spinner, Table, TableHeader, TableRow, TableBody, TableCell, TableColumn } from "@heroui/react";

describe("Render Component", () => {
  it("table has data", async () => {
    const queryClient = new QueryClient();

    const UsersTable = () => {
      const { data, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => axios.get("https://jsonplaceholder.typicode.com/users").then((res) => res.data),
      });

      const list = useAsyncList({
        async load() {
          return {
            items: data || []
          };
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
      }, [data]);

      return (
        <Table
          id="mock-users-table"
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
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <HeroUIProvider>
          <UsersTable />
        </HeroUIProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(5);
    });
  });
});