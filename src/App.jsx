import { useRef, useState } from "react";
import "./App.css";

const KEY = "customer-manager.v1";
const blank = { name: "", phone: "", email: "", company: "", status: "Active" };
function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data)
      ? data.filter(
          (c) =>
            c &&
            typeof c.id === "string" &&
            Object.keys(blank).every((k) => typeof c[k] === "string"),
        )
      : [];
  } catch {
    return [];
  }
}
export default function App() {
  const [customers, setCustomers] = useState(load);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const dialog = useRef(null);
  const deleteDialog = useRef(null);
  const addButton = useRef(null);
  function persist(next, message) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setCustomers(next);
      setNotice(message);
      setError("");
      return true;
    } catch {
      setError(
        "Your browser could not save this change. Free some storage or allow local storage, then try again.",
      );
      return false;
    }
  }
  function open(customer) {
    setEditing(customer?.id || null);
    setForm(customer ? { ...customer } : { ...blank });
    dialog.current.showModal();
  }
  function save(event) {
    event.preventDefault();
    const clean = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim()]),
    );
    if (!clean.name) return;
    const customer = { ...clean, id: editing || crypto.randomUUID() };
    const next = editing
      ? customers.map((c) => (c.id === editing ? customer : c))
      : [...customers, customer];
    if (persist(next, editing ? "Customer updated." : "Customer added."))
      dialog.current.close();
  }
  const shown = customers.filter(
    (c) =>
      (filter === "All statuses" || c.status === filter) &&
      Object.values(c).some((v) =>
        v.toLowerCase().includes(query.toLowerCase().trim()),
      ),
  );
  return (
    <div className="app-shell">
      <aside>
        <a className="brand" href="#">
          <span className="brand-icon">c.</span> customerly
        </a>
        <div className="workspace">YOUR WORKSPACE</div>
        <div className="nav-active">
          <span>▦</span> Customers{" "}
          <span className="nav-count">{customers.length}</span>
        </div>
        <div className="aside-bottom">
          <span className="little-dot" /> A little more organized.
          <br />
          <small>A lot more connected.</small>
        </div>
      </aside>
      <main>
        <header>
          <span>
            Workspace <span className="slash">/</span>{" "}
            <strong>Customers</strong>
          </span>
          <span className="profile">
            You <b>Y</b>
          </span>
        </header>
        <section className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">GOOD RELATIONSHIPS START HERE</div>
              <h1>Your customers, together.</h1>
              <p>
                A simple space to keep track of the people behind your business.
              </p>
            </div>
            <button className="primary" ref={addButton} onClick={() => open()}>
              ＋ Add customer
            </button>
          </div>
          <div className="stats">
            <Stat
              icon="♧"
              title="Total customers"
              value={customers.length}
              note="People in your corner"
            />
            <Stat
              icon="✓"
              title="Active customers"
              value={customers.filter((c) => c.status === "Active").length}
              note="Connections growing strong"
            />
            <Stat
              icon="✧"
              title="New leads"
              value={customers.filter((c) => c.status === "Lead").length}
              note="The start of something good"
            />
          </div>
          <section className="customer-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  Customer directory <span>{customers.length}</span>
                </h2>
                <p>All your connections, in one place.</p>
              </div>
              <span className="local-badge">● Saved on this device</span>
            </div>
            <div className="toolbar">
              <label className="search">
                <span aria-hidden="true">⌕</span>
                <input
                  aria-label="Search customers"
                  placeholder="Search name, email, company…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Filter by status"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {["All statuses", "Active", "Lead", "Inactive"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div role="status" className="notice">
              {notice}
            </div>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            {shown.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Contact details</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="person">
                            <span className="avatar" aria-hidden="true">
                              {c.name
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                            <strong>{c.name}</strong>
                          </div>
                        </td>
                        <td>
                          <div>{c.email || "No email added"}</div>
                          <small>{c.phone || "No phone added"}</small>
                        </td>
                        <td>{c.company || "—"}</td>
                        <td>
                          <span className={`status ${c.status.toLowerCase()}`}>
                            ● {c.status}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              onClick={() => open(c)}
                              aria-label={`Edit ${c.name}`}
                            >
                              Edit
                            </button>
                            <button
                              className="danger"
                              onClick={() => {
                                setDeleting(c);
                                deleteDialog.current.showModal();
                              }}
                              aria-label={`Delete ${c.name}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                <div className="empty-icon">♧</div>
                <h3>
                  {customers.length
                    ? "No matching customers"
                    : "Make room for your first connection"}
                </h3>
                <p>
                  {customers.length
                    ? "Try a different search or status to find who you’re looking for."
                    : "Add your first customer and start building better relationships."}
                </p>
                {!customers.length && (
                  <button className="primary" onClick={() => open()}>
                    ＋ Add your first customer
                  </button>
                )}
              </div>
            )}
            <div className="panel-footer">
              {shown.length} customer{shown.length === 1 ? "" : "s"} shown
              <span>No spreadsheets. Just connections.</span>
            </div>
          </section>
          <footer>
            Made for people, and the businesses they build. <span>✧</span>
          </footer>
        </section>
      </main>
      <dialog ref={dialog}>
        <form onSubmit={save}>
          <div className="modal-heading">
            <div>
              <h2>{editing ? "Edit customer" : "A new connection"}</h2>
              <p>Keep the details that help you stay in touch.</p>
            </div>
            <button
              type="button"
              aria-label="Close form"
              onClick={() => dialog.current.close()}
            >
              ×
            </button>
          </div>
          {[
            ["name", "Customer name", "text"],
            ["phone", "Phone", "tel"],
            ["email", "Email", "email"],
            ["company", "Company", "text"],
          ].map(([key, label, type]) => (
            <label className="field" key={key}>
              {label}
              {key === "name" ? " *" : " (optional)"}
              <input
                autoFocus={key === "name"}
                required={key === "name"}
                type={type}
                maxLength={200}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
          <label className="field">
            Status
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {["Active", "Lead", "Inactive"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button type="button" onClick={() => dialog.current.close()}>
              Cancel
            </button>
            <button className="primary" type="submit">
              {editing ? "Save changes" : "Add customer"}
            </button>
          </div>
        </form>
      </dialog>
      <dialog ref={deleteDialog}>
        <h2>Delete {deleting?.name}?</h2>
        <p>
          This removes the customer from this browser. This cannot be undone.
        </p>
        <div className="modal-actions">
          <button onClick={() => deleteDialog.current.close()}>
            Keep customer
          </button>
          <button
            className="delete-confirm"
            onClick={() => {
              if (
                persist(
                  customers.filter((c) => c.id !== deleting.id),
                  "Customer deleted.",
                )
              ) {
                deleteDialog.current.close();
                addButton.current.focus();
              }
            }}
          >
            Delete customer
          </button>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </dialog>
    </div>
  );
}
function Stat({ icon, title, value, note }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{title}</span>
        <b>{icon}</b>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
