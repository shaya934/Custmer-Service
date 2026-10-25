// @vitest-environment jsdom
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
async function add(user, name = "Alex Rivera") {
  await user.click(
    screen.getByRole("button", { name: "＋ Add customer", exact: true }),
  );
  await user.type(screen.getByLabelText("Customer name *"), name);
  await user.type(screen.getByLabelText("Phone (optional)"), "555-123-4567");
  await user.type(
    screen.getByLabelText("Email (optional)"),
    "alex@example.com",
  );
  await user.type(screen.getByLabelText("Company (optional)"), "River Studio");
  await user.selectOptions(
    screen.getByLabelText("Status", { exact: true }),
    "Lead",
  );
  await user.click(
    screen.getByRole("button", { name: "Add customer", exact: true }),
  );
}
test("add, search, filter, edit, reload, and confirm deletion", async () => {
  const user = userEvent.setup();
  const view = render(<App />);
  await add(user);
  expect(screen.getByRole("cell", { name: "Alex Rivera" })).toBeInTheDocument();
  expect(
    screen.getByRole("cell", { name: /alex@example.com/ }),
  ).toHaveTextContent("555-123-4567");
  await user.type(
    screen.getByRole("textbox", { name: "Search customers" }),
    "missing",
  );
  expect(screen.getByText("No matching customers")).toBeInTheDocument();
  await user.clear(screen.getByRole("textbox", { name: "Search customers" }));
  await user.type(
    screen.getByRole("textbox", { name: "Search customers" }),
    "river studio",
  );
  expect(screen.getByRole("cell", { name: "Alex Rivera" })).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText("Filter by status"), "Active");
  expect(screen.getByText("No matching customers")).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText("Filter by status"), "Lead");
  await user.click(screen.getByRole("button", { name: "Edit Alex Rivera" }));
  await user.clear(screen.getByLabelText("Customer name *"));
  await user.type(screen.getByLabelText("Customer name *"), "Alex Morgan");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  view.unmount();
  render(<App />);
  expect(screen.getByRole("cell", { name: "Alex Morgan" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Delete Alex Morgan" }));
  await user.click(screen.getByRole("button", { name: "Keep customer" }));
  expect(screen.getByRole("cell", { name: "Alex Morgan" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Delete Alex Morgan" }));
  await user.click(
    screen.getByRole("button", { name: "Delete customer", exact: true }),
  );
  expect(
    screen.getByText("Make room for your first connection"),
  ).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem("customer-manager.v1"))).toEqual([]);
});
test("requires a name and allows cancelling without adding a customer", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(
    screen.getByRole("button", { name: "＋ Add customer", exact: true }),
  );
  const modal = screen.getByRole("dialog");
  await user.click(
    within(modal).getByRole("button", { name: "Add customer", exact: true }),
  );
  expect(screen.getByLabelText("Customer name *")).toBeInvalid();
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(localStorage.getItem("customer-manager.v1")).toBeNull();
});
test("starts safely with malformed saved data", () => {
  localStorage.setItem("customer-manager.v1", "broken json");
  render(<App />);
  expect(
    screen.getByText("Make room for your first connection"),
  ).toBeInTheDocument();
});
test("reports storage failures without pretending the customer was saved", async () => {
  const user = userEvent.setup();
  render(<App />);
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Storage full");
  });
  await add(user);
  expect(screen.getByRole("dialog")).toBeVisible();
  expect(screen.getAllByRole("alert")[0]).toHaveTextContent("could not save");
  expect(
    screen.queryByRole("cell", { name: "Alex Rivera" }),
  ).not.toBeInTheDocument();
});
