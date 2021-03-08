/*This  solution is rather a pseudocode as I encountered too many errors on the way.
The solution is not practical either, for it is very limited in terms
of the language that can be used as input. However, it should work in theory.

This code makes use of SRGS grammar that produces an object consisting of
5 frames: name, day, time, help, and yes_no. The grammar can be found in 
/grammars/VGappointmentGrammar.ts. As can be seen below, I tried to take the 
input, transform it into 5 frames, and then use the frame values to decide 
how much information about the appointment is already received and how much is
still needed. If certain pieces of information are missing, the values of the
'frames' are set to 'None'. This is done since it allows for comparison later.

For instance, if the input is 'Meeting with Bob on Monday at 13', the frames are
as follows:

1) name: Bob
2) day: Monday
3) time: 13
4) help: None
5) yes_no: None

In this example, all the 3 frames with name, date, and time are filled, meaning 
that it is possible to firstly record the values of the frames (those are parsed 
and stored in a list) and proceed to final state with the confirmation.

In comparison, if the input is 'help', the list produced from the frames would be
the following: [None, None, None, help, None]. Since the second to last element of 
the list is 'help', it is safe to prompt the 'help' state.

The main principle of how the method works can be explained in conditions. If the first
three elements of the frame-list are not 'None', the three pieces of information, namely
the name, day, and time can be extracted and stored. For yes/no questions, on the other hand,
only the last element of the list has to be not 'None', meaning that th evalue can be extracted
and used to navigate further through the states. 


Such solution works in theory; however, due to my increadibly limited knowledge of TypeScript
and lack of time, I did not manage to implement it fully. Some of the issues that I've
encountered on the way:

1) The 5 frames are being overwritten every time new input is provided. Hence, every time
a transition is made into the 'ask' state, the previous 5 frames are lost. 

2) The number of conditions required to navigate through the states with this method is 
a bit too challenging.

3) The 'nomatch' state never prompts, even if the input (also known as context, or recResult)
is 'undefined'. It always goes to timeout instead'. 

4) When input is recognized by the grammar and an object of 5 frames is sucessfully produced,
the the statechart does not transition to the state it is instructed to. To test this, try
answering 'Bob' or 'Bob on Monday' to the question 'Who are you meeting with' after running
the statechart with npm start. 

*/

import { MachineConfig, send, Action, assign, actions } from "xstate";
import { loadGrammar } from './runparser'
import { parse } from './chartparser'
import { grammar } from './grammars/VGappointmentGrammar'

const gramm = loadGrammar(grammar)

let UsersCommand = (recResult: string) => {
const prs = parse(recResult.split(/\s+/), gramm);
const result = prs.resultsForRule(gramm.$root)[0];     
return [result.name, result.day, result.time, result.help, result.yes_no]}

export function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

export function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

function say_ask_nomatch_timeout(say_this: Action<SDSContext, SDSEvent>, help_message: string): MachineConfig<SDSContext, any, SDSEvent> {
    return ({ 
        initial: 'prompt',
        states: {
            prompt: {
                entry: say_this,

                on: { ENDSPEECH: 'ask1' }
            },
            ask1: {
                entry: [send('LISTEN'), send ('TIMEOUT1', {delay: 4500, id: 'time1'})]
            },
            ask2: {
                entry: [send('LISTEN'), send ('TIMEOUT2', {delay: 4500, id: 'time2'})]
            },
            ask3: {
                entry: [send('LISTEN'), send ('TIMEOUT3', {delay: 4500, id: 'time3'})]
            },
            ask4: {
                entry: [send('LISTEN'), send ('TIMEOUT4', {delay: 4500, id: 'time4'})]
            },
            nomatch: {
                entry: say('Sorry, I did not manage to understand this one. Please repeat.'),
                on: {ENDSPEECH: "ask2"}
            },
            timeout1: {
                entry: say('Sorry, I either did not understand or hear you this time, please speak louder.'),
                on: {ENDSPEECH: "ask2"}
            },
            timeout2: {
                entry: say('Sorry, I still either cannot hear or undertand you, please try again.'),
                on: {ENDSPEECH: "ask3"}
            },
            timeout3: {
                entry: say('Sorry, still nothing.'),
                on: {ENDSPEECH: "ask4"}
            },
            timeout4: {
                //Add idle state after 3 reprompts//
                entry: say('My apologies, I give up. Returning to idle.'),
                on: {ENDSPEECH: "idle"}
            },
            idle:{
                type: 'final'
            },
            to_do:{
                entry: say('Sorry, this tool has not been developed yet. I will now return to idle state.'),
                on: {ENDSPEECH: 'idle'}
            },
            specific:{
                entry: say("Please be more specific"),
                on: {ENDSPEECH: "ask2"}
            },
            canceled:{
                entry: say("Your appointment has been canceled. I will now returnto idle state.")
            },
            help:{
                entry: say(help_message),
                on: {ENDSPEECH: "ask2"}
            }
        }
    })
}

const {cancel} = actions

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    
    initial: 'start_point',
    states: {
        start_point:{
            id: 'starting_point',
            on: {
                CLICK: 'appointment'
            }
        },
        appointment:{
            initial: 'prompt',
            on:{ ENDSPEECH: 'who'
            },
            states:{
                prompt:{
                    entry: say("Let's create an appointment.")
                }
            }
        },
            who: {
                initial: "prompt",
                on: {
                    RECOGNISED: [{
                        cond: (context) => {return { AppointmentCommand: UsersCommand(context.recResult) } !== undefined},
                        actions: [assign((context) => { return {srgs_name: UsersCommand(context.recResult)[0] }}),
                                  assign((context) => { return {srgs_day: UsersCommand(context.recResult)[1] }}),
                                  assign((context) => { return {srgs_time: UsersCommand(context.recResult)[2] }}),
                                  assign((context) => { return {srgs_help: UsersCommand(context.recResult)[3] }}),
                                  assign((context) => { return {srgs_yes_no: UsersCommand(context.recResult)[4] }}),
                        cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: 'who_processing'},

                        {cond: (context) => {return { AppointmentCommand: UsersCommand(context.recResult) } === undefined},
                        target: ".nomatch"}],
                    
                        TIMEOUT1: '.timeout1',
                        TIMEOUT2: '.timeout2',
                        TIMEOUT3: '.timeout3',
                        TIMEOUT4: '.timeout4'
                    
                },
                ...say_ask_nomatch_timeout(say('Who are you meeting with?'), "Please specify the name of the person you are planning to meet up with. Pick someone from your contacts list.")
            },
            who_processing:{
                initial: "prompt",
                on:{
                    RECOGNISED: [{
                        cond: (context) => UsersCommand(context.recResult)[0] !== "None" && //Name provided +++
                        UsersCommand(context.recResult)[1] !== "None" &&  //Day provided +++
                         UsersCommand(context.recResult)[2] !== "None" && //Time provided +++
                         UsersCommand(context.recResult)[3] === "None" && //Not a help answer ---
                         UsersCommand(context.recResult)[4] === "None",//Not a yes_no answer ---
                       actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                       target: "repetition"
                       },

                       {cond: (context) => UsersCommand(context.recResult)[0] !== "None" && //Name provided +++
                       UsersCommand(context.recResult)[1] !== "None" &&  //Day provided +++
                        UsersCommand(context.recResult)[2] === "None" && //Time not provided ---
                        UsersCommand(context.recResult)[3] === "None" && //Not a help answer ---
                        UsersCommand(context.recResult)[4] === "None",//Not a yes_no answer ---
                      actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                      target: "length"
                      },

                      {cond: (context) => UsersCommand(context.recResult)[0] !== "None" && //Name provided +++
                      UsersCommand(context.recResult)[1] === "None" &&  //Day not provided ---
                       UsersCommand(context.recResult)[2] === "None" && //Time not provided ---
                       UsersCommand(context.recResult)[3] === "None" && //Not a help answer ---
                       UsersCommand(context.recResult)[4] === "None",//Not a yes_no answer ---
                     actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                     target: "day"
                     },

                     {cond: (context) => UsersCommand(context.recResult)[0] === "None" && //Name provided ----
                     UsersCommand(context.recResult)[1] === "None" &&  //Day not provided ---
                      UsersCommand(context.recResult)[2] === "None" && //Time not provided ---
                      UsersCommand(context.recResult)[3] === "help" && //Help answer +++
                      UsersCommand(context.recResult)[4] === "None",//Not a yes_no answer ---
                    actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                    target: ".help"
                    },

                   {target: ".nomatch" }],
                   
                       TIMEOUT1: '.timeout1',
                       TIMEOUT2: '.timeout2',
                       TIMEOUT3: '.timeout3',
                       TIMEOUT4: '.timeout4'
                   
               },
                   ...say_ask_nomatch_timeout(say("test"),"test")
            },

            day: {
                initial: "prompt",
                on: {ENDSPEECH: '#starting_point'},
                states:{
                    prompt: {
                        entry: say('Reached day')
                }}
            },
            length: {
                initial: "prompt",
                on: {ENDSPEECH: '#starting_point'},
                states:{
                    prompt: {
                        entry: say('Reached length')
                }}
            },
            repetition: {
                initial: "prompt",
                on: {ENDSPEECH: '#starting_point'},
                states:{
                    prompt: {
                        entry: say('Reached repetition')
                }}
            }
            /* day: {
                initial: "prompt",
                on: {
                    RECOGNISED: [{
                        cond: (context) => "day" in (grammar[context.recResult] || {}),
                        actions: [assign((context) => {return{ day: grammar[context.recResult].day}}), cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: "length"
                    },

                    {
                        cond: (context) => "help" in (grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".help"
                    },

                    {actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                    target: ".nomatch"}],

                    TIMEOUT1: '.timeout1',
                    TIMEOUT2: '.timeout2',
                    TIMEOUT3: '.timeout3',
                    TIMEOUT4: '.timeout4'
                },
                ...say_ask_nomatch_timeout(say('On which day is your meating?'), "You need to specify the day on which you meeting is to be held. Please pick a day of the week. ") //Can add name specification
            },
            length: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: "whole_day"},

                        {cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: "time"},

                        {cond: (context) => "uncertain" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".specific"},

                        {cond: (context) => "help" in (grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".help"},

                    {actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target:".nomatch"}],

                    TIMEOUT1: '.timeout1',
                    TIMEOUT2: '.timeout2',
                    TIMEOUT3: '.timeout3',
                    TIMEOUT4: '.timeout4'

                    },
                
                    ...say_ask_nomatch_timeout(say('Will it take the whole day?'), "You need to specify whether your meeting will take the whole day so that I can book it accordingly. Please answer with yes or no.")
            },
            time: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{

                    cond: (context) => "time" in (grammar[context.recResult] || {}),
                    actions: [assign((context) => {return{ time: grammar[context.recResult].time}}), cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                    target: "repetition"},

                    {cond: (context) => "help" in (grammar[context.recResult] || {}),
                    actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                    target: ".help"},

                    {
                    actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                    target: ".nomatch"
                    }],

                    TIMEOUT1: '.timeout1',
                    TIMEOUT2: '.timeout2',
                    TIMEOUT3: '.timeout3',
                    TIMEOUT4: '.timeout4'
                },
                ...say_ask_nomatch_timeout(say('At what time is your meeting?'), "You need to specify the time when your meeting will start so that I can book it accordingly. Please tell me the time in military notation or, in other words, 24-hours format.")
            },
            whole_day: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: "confirmation"},
                        {
                        cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".canceled"},

                        {cond: (context) => "help" in (grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".help"},

                    {
                    actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                    target: ".nomatch"}],

                    TIMEOUT1: '.timeout1',
                    TIMEOUT2: '.timeout2',
                    TIMEOUT3: '.timeout3',
                    TIMEOUT4: '.timeout4'
                },
                ...say_ask_nomatch_timeout(send((context) => ({
                    type: "SPEAK",
                    value: `Just to confirm, do you want me to make an appointment with ${context.person} on ${context.day} for the whole day?`})), 
                    "This is just to confirm the details of your meeting, please say 'no' if you want to cancel it and 'yes' if you want to confirm the meeting.")
                },
            repetition: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: "confirmation"},
                        
                        {
                        cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".canceled"},

                        {cond: (context) => "unsure" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".specific"},

                        {cond: (context) => "help" in (grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".help"},

                    {
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".nomatch"}],

                    TIMEOUT1: '.timeout1',
                    TIMEOUT2: '.timeout2',
                    TIMEOUT3: '.timeout3',
                    TIMEOUT4: '.timeout4'
                },
                ...say_ask_nomatch_timeout(send((context) => ({
                    type: "SPEAK",
                    value: `Just to confirm, do you want me to make an appointment with ${context.person} on ${context.day} at ${context.time}?`})),
                     "This is just to confirm the details of your meeting, please say 'no' if you want to cancel it and 'yes' if you want to confirm it.") 
                },
            confirmation: {
                initial: "prompt" ,
                on: {
                     RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".to_do"},
                        {
                        cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".idle"},
                        {
                        cond: (context) => "unsure" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".specific"},

                        {cond: (context) => "help" in (grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".help"},

                    {
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".nomatch"}],

                    TIMEOUT1: '.timeout1',
                    TIMEOUT2: '.timeout2',
                    TIMEOUT3: '.timeout3',
                    TIMEOUT4: '.timeout4'
                },
                ...say_ask_nomatch_timeout(say('Your appointment has been scheduled! Do you want me to add it to your to do item?'), 
                "The appointment tool has not yet been developed, and I only need to ask this as a formality, please say yes.")
                } */
            
            
            
            },
        }
)
