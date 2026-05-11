import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import { dateFormat } from "../../lib/dateFormat";
import toast from "react-hot-toast";
import { apiDelete, apiGet, apiPut } from "../../lib/api";

export const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editWhen, setEditWhen] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/api/shows");
      setShows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (show) => {
    setEditing(show._id);
    setEditPrice(String(show.showPrice));
    const d = new Date(show.showDateTime);
    const pad = (n) => String(n).padStart(2, "0");
    setEditWhen(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await apiPut(`/api/admin/shows/${editing}`, {
        showPrice: Number(editPrice),
        showDateTime: new Date(editWhen).toISOString(),
      });
      toast.success("Show updated");
      setEditing(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this screening?")) return;
    try {
      await apiDelete(`/api/admin/shows/${id}`);
      toast.success("Deleted");
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="List" text2="Shows" />
      <div className="max-w-5xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">Movie Name</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Seats sold</th>
              <th className="p-2 font-medium">Gross</th>
              <th className="p-2 font-medium pr-5">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {shows.map((show) => (
              <tr
                key={show._id}
                className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 min-w-45 pl-5">{show.movie?.title}</td>
                <td className="p-2">{dateFormat(show.showDateTime)}</td>
                <td className="p-2">{Object.keys(show.occupiedSeats || {}).length}</td>
                <td className="p-2">
                  {currency} {Object.keys(show.occupiedSeats || {}).length * show.showPrice}
                </td>
                <td className="p-2 pr-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(show)}
                    className="text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(show._id)} className="text-red-400 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing ? (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-primary/30 rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="font-semibold text-lg">Edit screening</h3>
            <label className="block text-sm">
              Date & time
              <input
                type="datetime-local"
                value={editWhen}
                onChange={(e) => setEditWhen(e.target.value)}
                className="mt-1 w-full rounded bg-gray-800 border border-gray-600 px-2 py-2"
              />
            </label>
            <label className="block text-sm">
              Price ({currency})
              <input
                type="number"
                min={0}
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="mt-1 w-full rounded bg-gray-800 border border-gray-600 px-2 py-2"
              />
            </label>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded border border-gray-600">
                Cancel
              </button>
              <button type="button" onClick={saveEdit} className="px-4 py-2 rounded bg-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
