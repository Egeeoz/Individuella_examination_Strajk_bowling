import './BookingInfo.scss';

import Input from '../Input/Input';

function BookingInfo({ updateBookingDetails }) {
  return (
    <section className="booking-info">
      <header>
        <h2 className="booking-info__heading">When, WHAT & Who</h2>
      </header>
      <form className="booking-info__details">
        <section className="booking-info__when">
          <Input
            label="Date"
            type="date"
            customClass="booking-info__date"
            name="when"
            handleChange={updateBookingDetails}
            id="date"
          />
          <Input
            label="Time"
            type="time"
            name="time"
            handleChange={updateBookingDetails}
            id="time"
          />
        </section>
        <Input
          label="Number of awesome bowlers"
          type="number"
          customClass="booking-info__who"
          name="people"
          handleChange={updateBookingDetails}
          maxLength={2}
          id="awesome-bowlers"
        />
        <Input
          label="Number of lanes"
          type="number"
          customClass="booking-info__lanes"
          name="lanes"
          handleChange={updateBookingDetails}
          maxLength={2}
          id="lanes"
        />
      </form>
    </section>
  );
}

export default BookingInfo;
