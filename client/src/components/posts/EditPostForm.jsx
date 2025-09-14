function EditPostForm({ formData, handleChange, handleEditSubmit, postId }) {
  // Handle new images preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    handleChange({
      target: { name: "images", value: files },
    });
  };

  return (
    <form
      onSubmit={(e) => handleEditSubmit(e, postId)}
      className="max-w-5xl mx-auto mt-4 p-6 bg-gray-800 rounded-lg shadow-md space-y-4"
    >
      <h2 className="text-2xl font-semibold text-white mb-6">Edit Post</h2>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-gray-300 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Post Title"
        />
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-gray-300 mb-1">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your post..."
        ></textarea>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-gray-300 mb-1">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a Category</option>
          <option value="news">News</option>
          <option value="lost_and_found">Loast and Found</option>
          <option value="help_request">Help Request</option>
        </select>
      </div>

      {/* Images */}
      <div>
        <label htmlFor="images" className="block text-gray-300 mb-1">
          Images (max 3)
        </label>
        <input
          type="file"
          id="images"
          name="images"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="w-full text-gray-300"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded transition"
      >
        Save Changes
      </button>
    </form>
  );
}

export default EditPostForm;
