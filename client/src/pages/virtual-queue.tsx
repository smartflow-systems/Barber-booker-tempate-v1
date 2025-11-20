import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, Bell, CheckCircle, AlertCircle, Navigation, Phone } from 'lucide-react';
import '@/styles/sfs-complete-theme.css';

export default function VirtualQueue() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const queueStatus = {
    position: 3,
    totalInQueue: 12,
    estimatedWaitTime: 25,
    averageServiceTime: 35,
    currentlyServing: 'Walk-in #7',
    yourTicket: 'VQ-2024-0042',
    joinedAt: '2:15 PM',
  };

  const locations = [
    {
      id: 1,
      name: 'Downtown',
      address: '123 Main St',
      queueSize: 5,
      waitTime: 20,
      distance: '0.3 mi',
      open: true,
    },
    {
      id: 2,
      name: 'Westside',
      address: '456 Oak Ave',
      queueSize: 12,
      waitTime: 45,
      distance: '1.2 mi',
      open: true,
    },
    {
      id: 3,
      name: 'Eastside',
      address: '789 Elm St',
      queueSize: 3,
      waitTime: 15,
      distance: '2.1 mi',
      open: true,
    },
    {
      id: 4,
      name: 'Uptown',
      address: '321 Pine Rd',
      queueSize: 0,
      waitTime: 0,
      distance: '3.5 mi',
      open: false,
    },
  ];

  const upcomingQueue = [
    { ticket: 'VQ-2024-0040', name: 'Current', status: 'serving', barber: 'Marcus', time: 'Now' },
    { ticket: 'VQ-2024-0041', name: 'Next', status: 'next', barber: 'David', time: '~5 min' },
    { ticket: 'VQ-2024-0042', name: 'You', status: 'waiting', barber: 'Marcus', time: '~25 min' },
    { ticket: 'VQ-2024-0043', name: 'After You', status: 'waiting', barber: 'Sarah', time: '~40 min' },
    { ticket: 'VQ-2024-0044', name: 'Position 5', status: 'waiting', barber: 'Alex', time: '~55 min' },
  ];

  const barbers = [
    { name: 'Marcus Johnson', avatar: '👨🏿', status: 'busy', currentTicket: 'VQ-2024-0040', nextAvailable: '5 min' },
    { name: 'David Chen', avatar: '👨🏻', status: 'busy', currentTicket: 'VQ-2024-0041', nextAvailable: '15 min' },
    { name: 'Sarah Williams', avatar: '👩🏼', status: 'available', currentTicket: null, nextAvailable: 'Now' },
    { name: 'Alex Rodriguez', avatar: '👨🏽', status: 'break', currentTicket: null, nextAvailable: '10 min' },
  ];

  const notifications = [
    { time: '2:30 PM', message: '2 people ahead of you', type: 'info' },
    { time: '2:45 PM', message: 'Almost your turn! Get ready', type: 'warning' },
    { time: '3:00 PM', message: 'Your turn is next', type: 'success' },
  ];

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  return (
    <div className="min-h-screen bg-sf-black">
      {/* Animated Background */}
      <canvas
        id="sfs-circuit"
        className="fixed top-0 left-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="text-center py-20 px-6">
          <div className="inline-block mb-6">
            <span className="badge-gold text-base px-6 py-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Virtual Queue
            </span>
          </div>
          <h1 className="heading-luxury text-5xl md:text-7xl mb-6">
            Skip The Wait,
            <br />
            <span className="text-glow">Not The Service</span>
          </h1>
          <p className="text-xl text-sf-text-secondary max-w-2xl mx-auto">
            Join our virtual queue and get notified when it's your turn
          </p>
        </div>

        {/* Current Queue Status */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="glass-panel p-8">
            {/* Live Time */}
            <div className="text-center mb-8">
              <div className="text-sm text-sf-text-muted mb-2">Current Time</div>
              <div className="text-4xl font-bold text-gold">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>

            {/* Queue Position */}
            <div className="glass-card p-8 mb-6 text-center">
              <div className="mb-4">
                <div className="text-sm text-sf-text-muted mb-2">Your Position</div>
                <div className="text-7xl font-bold text-gold mb-2">
                  #{queueStatus.position}
                </div>
                <div className="text-sf-text-secondary">
                  out of {queueStatus.totalInQueue} in queue
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="h-3 bg-sf-brown rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sf-gold via-sf-gold-light to-sf-gold-glow transition-all duration-1000"
                    style={{
                      width: `${
                        ((queueStatus.totalInQueue - queueStatus.position) /
                          queueStatus.totalInQueue) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Estimated Time */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="glass-card p-4">
                  <Clock className="w-6 h-6 text-gold mx-auto mb-2" />
                  <div className="text-2xl font-bold text-sf-text-primary mb-1">
                    {queueStatus.estimatedWaitTime}
                  </div>
                  <div className="text-xs text-sf-text-muted">Min Wait</div>
                </div>
                <div className="glass-card p-4">
                  <Users className="w-6 h-6 text-gold mx-auto mb-2" />
                  <div className="text-2xl font-bold text-sf-text-primary mb-1">
                    {queueStatus.position - 1}
                  </div>
                  <div className="text-xs text-sf-text-muted">Ahead of You</div>
                </div>
                <div className="glass-card p-4">
                  <CheckCircle className="w-6 h-6 text-gold mx-auto mb-2" />
                  <div className="text-2xl font-bold text-sf-text-primary mb-1">
                    {queueStatus.averageServiceTime}
                  </div>
                  <div className="text-xs text-sf-text-muted">Min Service</div>
                </div>
              </div>
            </div>

            {/* Ticket Info */}
            <div className="glass-card p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-sf-text-muted">Your Ticket</div>
                  <div className="text-xl font-bold text-gold">
                    {queueStatus.yourTicket}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-sf-text-muted">Joined At</div>
                  <div className="text-lg font-semibold text-sf-text-primary">
                    {queueStatus.joinedAt}
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gold" />
                  <div>
                    <div className="font-semibold text-sf-text-primary">
                      Get Notified
                    </div>
                    <div className="text-xs text-sf-text-muted">
                      Receive alerts when your turn approaches
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleEnableNotifications}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    notificationsEnabled ? 'bg-gold' : 'bg-sf-brown'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationsEnabled ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Timeline */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="glass-panel p-8">
            <h2 className="heading-gold text-2xl mb-6">Queue Timeline</h2>
            <div className="space-y-3">
              {upcomingQueue.map((item, idx) => (
                <div
                  key={item.ticket}
                  className={`glass-card p-4 flex items-center gap-4 ${
                    item.status === 'waiting' && item.name === 'You'
                      ? 'ring-2 ring-gold glow-gold'
                      : ''
                  }`}
                >
                  {/* Status Icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
                      item.status === 'serving'
                        ? 'bg-gradient-to-br from-green-600 to-green-400'
                        : item.status === 'next'
                        ? 'bg-gradient-to-br from-orange-600 to-orange-400'
                        : item.name === 'You'
                        ? 'bg-gradient-to-br from-sf-gold to-sf-gold-light'
                        : 'bg-sf-brown'
                    }`}
                  >
                    {item.status === 'serving' ? '✂️' : idx + 1}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sf-text-primary">
                        {item.name}
                      </span>
                      {item.status === 'serving' && (
                        <span className="badge-gold text-xs px-2 py-0.5">
                          In Service
                        </span>
                      )}
                      {item.status === 'next' && (
                        <span className="text-xs px-2 py-0.5 rounded bg-orange-900/30 text-orange-400">
                          Up Next
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-sf-text-muted">
                      {item.ticket} • Barber: {item.barber}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="text-right">
                    <div className="font-semibold text-gold">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Available Barbers */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="glass-panel p-8">
            <h2 className="heading-gold text-2xl mb-6">Barber Availability</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {barbers.map((barber) => (
                <div key={barber.name} className="glass-card p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{barber.avatar}</div>
                    <div className="flex-1">
                      <div className="font-bold text-sf-text-primary mb-1">
                        {barber.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            barber.status === 'available'
                              ? 'bg-green-400'
                              : barber.status === 'busy'
                              ? 'bg-red-400'
                              : 'bg-orange-400'
                          }`}
                        />
                        <span className="text-sm text-sf-text-muted capitalize">
                          {barber.status}
                          {barber.currentTicket && ` • ${barber.currentTicket}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-sf-text-muted mb-1">
                        Next Available
                      </div>
                      <div className="font-semibold text-gold">
                        {barber.nextAvailable}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Other Locations */}
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <div className="glass-panel p-8">
            <h2 className="heading-gold text-2xl mb-6">Other Locations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {locations.map((location) => (
                <div key={location.id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-sf-text-primary text-lg mb-1">
                        {location.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-sf-text-muted">
                        <MapPin className="w-4 h-4" />
                        {location.address}
                      </div>
                    </div>
                    <div
                      className={`text-xs px-3 py-1 rounded ${
                        location.open
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {location.open ? 'Open' : 'Closed'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gold mb-1">
                        {location.queueSize}
                      </div>
                      <div className="text-xs text-sf-text-muted">In Queue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gold mb-1">
                        {location.waitTime}
                      </div>
                      <div className="text-xs text-sf-text-muted">Min Wait</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gold mb-1">
                        {location.distance}
                      </div>
                      <div className="text-xs text-sf-text-muted">Away</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="btn-outline-gold flex-1 text-sm py-2">
                      <Navigation className="w-4 h-4 inline mr-1" />
                      Directions
                    </button>
                    <button
                      className="btn-gold flex-1 text-sm py-2"
                      disabled={!location.open}
                    >
                      Join Queue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notification History */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="glass-panel p-8">
            <h2 className="heading-gold text-2xl mb-6">Notification Timeline</h2>
            <div className="space-y-3">
              {notifications.map((notif, idx) => (
                <div key={idx} className="glass-card p-4 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notif.type === 'success'
                        ? 'bg-green-900/30'
                        : notif.type === 'warning'
                        ? 'bg-orange-900/30'
                        : 'bg-blue-900/30'
                    }`}
                  >
                    {notif.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : notif.type === 'warning' ? (
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                    ) : (
                      <Bell className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sf-text-primary">{notif.message}</div>
                  </div>
                  <div className="text-sm text-sf-text-muted">{notif.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="glass-panel p-8">
            <div className="text-center mb-6">
              <h3 className="heading-gold text-2xl mb-2">Need Help?</h3>
              <p className="text-sf-text-secondary">
                Our team is here to assist you
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="btn-outline-gold py-3">
                <Phone className="w-5 h-5 inline mr-2" />
                Call Shop
              </button>
              <button className="btn-outline-gold py-3">
                <MapPin className="w-5 h-5 inline mr-2" />
                Get Directions
              </button>
              <button className="btn-gold py-3">Leave Queue</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
