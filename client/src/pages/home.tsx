
function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-yellow-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">SmartFlow Booking</h1>
        <p className="text-gray-700 mb-6">
          Book your next barber appointment in seconds.
        </p>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="datetime-local"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition"
          >
            Book Appointment
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
