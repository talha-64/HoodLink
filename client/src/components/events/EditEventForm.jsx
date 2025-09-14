function getCurrentDateTimeLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function EditEventForm({ formData, handleChange, handleEditSubmit, eventId }) {
  return (
    <form
      onSubmit={(e) => handleEditSubmit(e, eventId)}
      className="max-w-5xl mx-auto mt-4 p-6 bg-gray-800 rounded-lg shadow-md space-y-4"
    >
      <h2 className="text-2xl font-semibold text-white mb-6">Edit Event</h2>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-gray-300 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="Title"
          value={formData.Title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Event Title"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="Description"
          value={formData.Description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Event Description"
        ></textarea>
      </div>

      {/* Event Date */}
      <div>
        <label htmlFor="event_Date" className="block text-gray-300 mb-1">
          Event Date
        </label>
        <input
          type="datetime-local"
          id="event_Date"
          name="event_Date"
          value={formData.event_Date}
          onChange={handleChange}
          required
          min={getCurrentDateTimeLocal()}
          className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-gray-300 mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="Location"
          value={formData.Location}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Event Location"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded transition"
      >
        Submit
      </button>
    </form>
  );
}

export default EditEventForm;
