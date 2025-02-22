import fastify from 'fastify';
import Event from '../models/Events.js';
import EventLoc from '../models/EventLoc.js';
import User from '../models/Users.js';
import EMB from '../models/EMB.js';

const app = fastify({
    logger: true
});




export const createEvent = async (request, reply) => {

    let { eventname, eventdate, eventlocation, amountrange, eventtime, totalseats, availableseats, bookedseats } = request.body;


    const eventDate = new Date(eventdate);
    const currentDate = new Date();

    if (eventDate <= currentDate) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'Event date must be in the future.',
        });
    }

    try {
        eventlocation = eventlocation.toLowerCase();
        const event = new Event({
            eventname,
            eventdate,
            eventlocation,
            amountrange,
            eventtime,
            totalseats,
            availableseats,
            bookedseats,
            userId: request.user.id,
        });

        console.log(event)
        await event.save();
        // const ArrayUserId=[];
        //    ArrayUserId= ArrayUserId.push(request.user.id);
        //     console.log(ArrayUserId)



        reply.send(event);
        console.log(event)

    } catch (err) {
        reply.status(400).send({ error: err.message })
    }

};


export const loc = async (request, reply) => {
    const { eventneedlocation } = request.body;
    try {

        const existinglocation=await EventLoc.findOne({
            userId: request.user.id
        })

        if(existinglocation){
            return reply.status(400).send({ message: "location already exist" })

        }
        const event = new EventLoc({
            eventneedlocation,
            userId: request.user.id
        });
        console.log(request.user.id)
        await event.save();
        reply.send(event);

    } catch (err) {
        reply.status(400).send({ message: "getting the error while giving the event location" })
    }
}

export const getevent = async (request, reply) => {
    try {


        const isAdmin = request.user.role === 'admin';

        // const admins = await User.find({ role: 'admin' });
        if (isAdmin) {
            const event = await Event.find({ userId: request.user.id });
            reply.send(event);
            console.log(event, "MODI, MODI , MODI")
            console.log(global.backlistedTokens);
            console.log(global.backlistedTokens);

        }
        else {

            const userlocation=await EventLoc.findOne({
                userId: request.user.id
            });

            console.log(userlocation,"sachin sachin sachin sachin sachin" )
            
            if(!userlocation){
                return reply.status(404).send({ message: "Please provide your location first." })
            }

            const loc = userlocation.eventneedlocation.toLowerCase();

            // Find events based on the user's location
            const event1 = await Event.find({ eventlocation: loc });

            if (!event1 || event1.length === 0) {
                return reply.status(404).send({ message: "No events found for this location" });
            }

            reply.send(event1);
        }

        //     const loc = await EventLoc.find({});
        //     console.log(request.user.id)
        //     console.log(loc)


        //     let t = loc[loc.length - 1].eventneedlocation;
        //     console.log(t)

        //     const loc1 = t.toLowerCase();
        //     const event1 = await Event.find({ eventlocation: loc1 })

        //     if (!event1) {
        //         return reply.status(404).send({ message: "location not matched" })
        //     }
        //     reply.send(event1);
        // }


    } catch (err) {
        reply.status(400).send({ error: err.message })
    }
};


export const eventbook = async (request, reply) => {

    const {  NoOfSeatsBooking } = request.body;





    try {



        //const event=await Event.find({ _id: request.params.id }); 
        const event = await Event.findById(request.params.id);

        if (event.availableseats === 0) {
            return reply.status(400).send({ message: "event is fully booked" })
        }


        if (NoOfSeatsBooking > event.availableseats) {
            return reply.status(400).send({ message: `maximum number of seats can be booked :${event.availableseats}, so please reduce the number of seats` })

        }



        console.log(event)

        // reply.send(event);

        const e = event.userId;
        console.log(e)

        const user = await User.findById(e);
        console.log(user)
        const eventid = event._id;
        console.log(eventid, "this is good to see this is good to see")

        const eventname = event.eventname;
        const eventdate = event.eventdate;
        const eventlocation = event.eventlocation;
        const amountrange = event.amountrange;
        const eventtime = event.eventtime;
        const eventManager = user.username;
        const eventManagerEmail = user.email;
        console.log(request.user.id)


        const n = await User.findById(request.user.id);
        console.log(n)
        const eventBookedBy = n.username;
        const email = n.email;
        const AmountNeedPay = event.amountrange * NoOfSeatsBooking

        console.log({ eventManager, eventManagerEmail, eventname, eventdate, eventlocation, amountrange, eventtime, eventBookedBy, email })

        const com = new EMB({
            eventid,
            eventManager,
            eventManagerEmail,
            eventname,
            eventdate,
            eventlocation,
            amountrange,
            eventtime,
           
            NoOfSeatsBooking,
            eventBookedBy,
            email,
            AmountNeedPay,
            userId: request.user.id
        })

        await com.save();
        console.log(com)
        reply.send(com);
        //const event1=await User.findById(request.user.id);


        const event1 = await Event.findById(request.params.id);

        // totalseats=100
        // availableseats=100
        // bookedseats=0

        event1.bookedseats = event1.bookedseats + com.NoOfSeatsBooking,

            event1.availableseats = event1.totalseats - event1.bookedseats

        await event1.save();


        /* 
        
         const event = await Event.findById(request.params.id);
         
        totalseats=100
        availableseats=100
        bookedseats=0
        
        bookedseats=bookedseats+com.NoOfSeatsBooking,
        
        availableseats=totalseats-bookedseats
        
        await event.save();
        
        */






    } catch (err) {
        reply.status(400).send({ error: err.message })
    }

}




export const getallbookings = async (request, reply) => {

    try {
        console.log(request.user.id, "sachin")
        const event = await EMB.find({ userId: request.user.id });
        // const event = await EMB.find({});
        reply.send(event);

    }
    catch (err) {
        reply.status(400).send({ error: err.message });

    }
}





// export const booking =async(request,reply)=>{
//     const { NoOfSeatsBooking} = request.body;

//     try{
//         console.log(request.user.id,"rgvrgvrgv")
//         const event=await EMB.findById(request.params.id);
//         console.log(event,"ahhhahhhh")

//         if (!event || event.userId.toString() !== request.user.id) {
//             return reply.status(400).send({ error: 'event not found here' })
//         }

//         if(NoOfSeatsBooking){
//             event.NoOfSeatsBooking=NoOfSeatsBooking;
//            }

//            console.log(event.eventid,"hbffffffffffffffffffff111111122ffffffffhbffffffffffrrdeasxasccccccccccccccccccccccsxffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffmjsbyyvcdcbkjhdacb")
//       const event1 = await Event.findById(event.eventid);
//       console.log(event1,"ipliplilil")
//       console.log(request.params.id)


//       if (NoOfSeatsBooking > event1.availableseats) {
//         return reply.status(400).send({ message: `maximum number of seats can be booked :${event.availableseats}, so please reduce the number of seats` })

//     }
// console.log(NoOfSeatsBooking)
//     event1.bookedseats = event1.bookedseats +NoOfSeatsBooking,

//         event1.availableseats = event1.totalseats - event1.bookedseats

//         const AmountNeedPay = event1.amountrange * NoOfSeatsBooking

//                          if(event.AmountNeedPay){
//                              event.AmountNeedPay=AmountNeedPay
//                          }            

//     await event1.save();

//         await event.save();
//         reply.send(event);


//     }
//     catch(err){

//             reply.status(400).send({ error: err.message });

//     }
// }



export const booking = async (request, reply) => {

    const { NoOfSeatsBooking } = request.body;

    try {
        console.log(request.user.id, "rgvrgvrgv")
        const book = await EMB.findByIdAndUpdate(request.params.id);
        console.log(book, "ahhhahhhh")

        if (!book || book.userId.toString() !== request.user.id) {
            return reply.status(400).send({ error: 'event not found here' })
        }


        const event1 = await Event.findByIdAndUpdate(book.eventid);


        if (NoOfSeatsBooking > event1.availableseats) {
            return reply.status(400).send({ message: `maximum number of seats can be booked :${event1.availableseats}, so please reduce the number of seats` })
        }

        // if (NoOfSeatsBooking) {
        //     book.NoOfSeatsBooking = NoOfSeatsBooking;
        // }
        if(book.NoOfSeatsBooking===NoOfSeatsBooking){
            return reply.status(200).send({message:"you are given same number of seats,so no changes in your booking"})

        }

        if(NoOfSeatsBooking===0){
            return reply.status(400).send({message:"no of seats cannot be zero"});
        }





        if (NoOfSeatsBooking) {

            if (book.NoOfSeatsBooking > NoOfSeatsBooking) {
                console.log(event1.availableseats,"availableseats-before")

                event1.availableseats = event1.availableseats + (book.NoOfSeatsBooking - NoOfSeatsBooking);
                console.log(event1.availableseats,"availableseats-after")
                console.log(event1.bookedseats,"bookedseats-before")
                event1.bookedseats = event1.totalseats - event1.availableseats
                console.log(event1.bookedseats,"bookedseats-after")
                book.AmountNeedPay = NoOfSeatsBooking * event1.amountrange
                console.log(book.NoOfSeatsBooking,"bookedseats-Before")
                book.NoOfSeatsBooking = NoOfSeatsBooking;
                console.log(book.AmountNeedPay, "sai")
                console.log(NoOfSeatsBooking)
                console.log(event1.amountrange)

            }

            else if (book.NoOfSeatsBooking < NoOfSeatsBooking) {
                console.log(event1.availableseats,"availableseats-before")


                event1.availableseats = event1.availableseats - (NoOfSeatsBooking - book.NoOfSeatsBooking);
                console.log(event1.availableseats,"availableseats-after")
                console.log(event1.bookedseats,"bookedseats-before")
                event1.bookedseats = event1.totalseats - event1.availableseats
                console.log(event1.bookedseats,"bookedseats-after")
                book.AmountNeedPay = NoOfSeatsBooking * event1.amountrange
                console.log(book.NoOfSeatsBooking,"bookedseats-Before")
                book.NoOfSeatsBooking = NoOfSeatsBooking;
                console.log(book.AmountNeedPay)
                console.log(NoOfSeatsBooking)
                console.log(event1.amountrange)

            }


        }
        await event1.save();
        await book.save();
        reply.send(book);

        console.log("this is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd kndthis is good in this area here in the nkd nkd nkd knd nnk dnk nkd nkd nkd nkd")

        // const event1 = await Event.findById(book.eventid);
        // console.log(event1, "ipliplilil")



        // console.log(book.eventid, "hbffffffffffffffffffff111111122ffffffffhbffffffffffrrdeasxasccccccccccccccffffffffffffffffffffffffmjsbyyvcdcbkjhdacb")
        // const event1 = await Event.findById(book.eventid);
        // console.log(event1, "ipliplilil")
        // console.log(request.params.id)


        // if (NoOfSeatsBooking > event1.availableseats) {
        //     return reply.status(400).send({ message: `maximum number of seats can be booked :${event.availableseats}, so please reduce the number of seats` })

        // }
        // console.log(NoOfSeatsBooking)
        // event1.bookedseats = event1.bookedseats + NoOfSeatsBooking,

        //     event1.availableseats = event1.totalseats - event1.bookedseats

        // const AmountNeedPay = event1.amountrange * NoOfSeatsBooking

        // if (book.AmountNeedPay) {
        //     book.AmountNeedPay = AmountNeedPay
        // }

        // await event1.save();
        // await book.save();
        // reply.send(book);


    }
    catch (err) {

        reply.status(400).send({ error: err.message });

    }
}



























export const getbyid = async (request, reply) => {

    try {
        const event = await Event.findById(request.params.id);

        if (!event || event.userId.toString() !== request.user.id) {
            return reply.status(404).send({ error: "event not found" })
        }

        reply.send(event);

    } catch (err) {
        reply.status(400).send({ error: err.message })
    }
}


export const updateevent = async (request, reply) => {
    const { eventname, eventdate, eventlocation, amountrange, eventtime } = request.body;


    const eventDate = new Date(eventdate);
    const currentDate = new Date();

    if (eventDate <= currentDate) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'Event date must be in the future.',
        });
    }


    try {
        const event = await Event.findById(request.params.id);
        console.log(event,"qodic qodic                      qodic")

        if (!event || event.userId.toString() !== request.user.id) {
            return reply.status(400).send({ error: 'event not found' })
        }
        if (eventname) event.eventname = eventname;
        if (eventdate) event.eventdate = eventdate;
        if (eventlocation) event.eventlocation = eventlocation;
        if (amountrange) event.amountrange = amountrange;
        if (eventtime) event.eventtime = eventtime;

        await event.save();
        reply.send(event);

    } catch (err) {
        reply.status(400).send({ error: err.message });

    }
};




export const eventdelete = async (request, reply) => {


    try {

        const event = await EMB.findById(request.params.id);

        if (!event || event.userId.toString() !== request.user.id) {
            return reply.status(400).send({ error: 'event not found' });
        }

        const d=event.NoOfSeatsBooking;

        const event1=await Event.findByIdAndUpdate(event.eventid);
        event1.bookedseats=event1.bookedseats-d;
        event1.availableseats=event1.totalseats-event1.bookedseats;

        await event1.save();


        await event.deleteOne();
        reply.send({ message: 'event deleted successfully' });

    }

    catch (err) {
        reply.status(400).send({ error: err.message });
    }
}










export const deleteevent = async (request, reply) => {
    try {

        const event = await Event.findById(request.params.id);
        if (!event || event.userId.toString() !== request.user.id) {
            return reply.status(400).send({ error: 'event not found' })
        }
        await event.deleteOne();

        reply.send({ message: 'event deleted successfully' });



    } catch (err) {
        reply.status(400).send({ error: err.message });

    }
};

