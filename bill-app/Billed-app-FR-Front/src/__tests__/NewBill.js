/**
 * @jest-environment jsdom
 */

// Allow to use matchers
import "@testing-library/jest-dom";
import { screen, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Verify bill file is loaded", () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init new bills container
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Check if New bills title exist inside the page
      const newBillsTitle = screen.getByText("Envoyer une note de frais");
      expect(newBillsTitle).toBeTruthy();
    });

    test("Verify bill file is submit", () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init new bills container
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const formNewBill = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBillContainer.handleSubmit(e));

      // Check if user clicked on submit btn
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    });

    test("Verify bill file is jpg or png only", () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init new bills container
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const file = new File(
        ["image"],
        "image.png",
        { type: "image/png" },
        ["image"],
        "image.jpg",
        { type: "image/jpg" }
      );
      const handleChangeFile = jest.fn((e) =>
        newBillContainer.handleChangeFile(e)
      );
      const billFile = screen.getByTestId("file");

      // Check if user upload file
      billFile.addEventListener("change", handleChangeFile);
      userEvent.upload(billFile, file);

      expect(billFile.files[0].name).toBeDefined();
      expect(handleChangeFile).toBeCalled();
    });

    test("bill is not png or jpg files and display error message", () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init new bills container
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBillContainer.handleChangeFile);
      const uploadFileBtn = screen.getByTestId("file");

      uploadFileBtn.addEventListener("change", handleChangeFile);

      const file = screen.getByTestId("file");

      // Fire DOM events
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
        },
      });

      const errorMessage = jest.fn(() => file.classList.add("error-message"));

      file.addEventListener("click", errorMessage);
      // Describe a user interaction
      userEvent.click(file);

      // Check of error message is displayed (not jpg or png)
      expect(handleChangeFile).toHaveBeenCalled();
      expect(file).toHaveClass("error-message");
      expect(newBillContainer.fileName).toBe("");
    });

    test("bill file is a png or a jpg then the file name should be displayed into the input", () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init new bills container
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBillContainer.handleChangeFile);
      const uploadFileBtn = screen.getByTestId("file");

      uploadFileBtn.addEventListener("change", handleChangeFile);

      const file = screen.getByTestId("file");

      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [
            new File(
              ["file.png"],
              "file.png",
              { type: "file/png" },
              ["file.jpg"],
              "file.jpg",
              { type: "file/jpg" }
            ),
          ],
        },
      });

      file.addEventListener("click", handleChangeFile);
      // Describe a user interaction
      userEvent.click(file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(file).not.toHaveClass("error-message");
    });
  });
});

// Integration test POST Bills
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("fetches new bills from mock API POST", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const html = NewBillUI();
      document.body.innerHTML = html;

      // Check if New bills title exist inside the page
      const newBillsTitle = screen.getByText("Envoyer une note de frais");
      expect(newBillsTitle).toBeTruthy();
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      test("Add bills from an API and fails with 404 message error", async () => {});

      test("Add bills from an API and fails with 500 message error", async () => {});
    });
  });
});
