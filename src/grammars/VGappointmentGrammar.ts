export const grammar = `
<grammar root="appointment">
    <rule id="appointment">
        <ruleref uri="#proposition"/>  
        <tag>
        out.name= rules.proposition.name;
        out.day= rules.proposition.day;
        out.time= rules.proposition.time;
        out.help = rules.proposition.help;
        out.yes_no = rules.proposition.yes_no
        </tag>
    </rule>    
    
    <rule id="names">
        <one-of>
            <item> Bob the Builder </item>
            <item> Bob <tag> out = 'Bob the Builder'; </tag></item>
            <item> John Appleseed </item>
            <item> John <tag> out = 'Appleseed'; </tag></item>
            <item> Jack Jackson </item>
            <item> Jack <tag> out = 'Jack Jackson'; </tag></item>
            <item> Liana Jelena </item>
            <item> Liana <tag> out = 'Liana Jelena'; </tag></item>
            <item> Natalie Portman </item>
            <item> Natalie <tag> out = 'Natalie Portman'; </tag></item>
            <item> Bob the Builder </item>
            <item> Bob <tag> out = 'Bob the Builder '; </tag></item>
            <item> Shrek from the Swamp </item>
            <item> Shrek <tag> out = 'Shrek from the Swamp '; </tag></item>
        </one-of>
    </rule>
    <rule id="days">
        <one-of>
            <item> Monday </item>            
            <item> on Monday <tag> out = 'Monday'; </tag> </item>
            <item> Tuesday</item>            
            <item> on Tuesday <tag> out = 'Tuesday'; </tag> </item>
            <item> Wednesday</item>            
            <item> on Wednesday <tag> out = 'Wednesday'; </tag> </item>
            <item> Thursday </item>            
            <item> on Thursday <tag> out = 'Thursday'; </tag> </item>
            <item> Friday</item>            
            <item> on Friday<tag> out = 'Friday'; </tag> </item>
            <item> Saturday</item>            
            <item> on Saturday<tag> out = 'Saturday'; </tag> </item>
            <item> Sunday</item>            
            <item> on Sunday<tag> out = 'Sunday'; </tag> </item>
        </one-of>
    </rule>
    <rule id="time">
        <one-of>
            <item> ten <tag> out = '10:00'; </tag></item>
            <item> 10 <tag> out = '10:00'; </tag></item>
            <item> at ten <tag> out = '10:00'; </tag></item>
            <item> at 10 <tag> out = '10:00'; </tag></item>
            <item> eleven <tag> out = '11:00'; </tag></item>
            <item> at eleven <tag> out = '11:00'; </tag></item>
            <item> 11 <tag> out = '11:00'; </tag></item>
            <item> at 11 <tag> out = '11:00'; </tag></item>
            <item> twelve <tag> out = '12:00'; </tag></item>
            <item> at twelve <tag> out = '12:00'; </tag></item>
            <item> 12 <tag> out = '12:00'; </tag></item>
            <item> at 12 <tag> out = '12:00'; </tag></item>
            <item> 13 <tag> out = '13:00'; </tag></item>
            <item> at 13 <tag> out = '13:00'; </tag></item>
            <item> thirteen <tag> out = '13:00'; </tag></item>
            <item> at thirteen <tag> out = '13:00'; </tag></item>
            <item> 14 <tag> out = '14:00'; </tag></item>
            <item> at 14 <tag> out = '14:00'; </tag></item>
            <item> fourteen <tag> out = '14:00'; </tag></item>
            <item> at fourteen <tag> out = '14:00'; </tag></item>
            <item> 15 <tag> out = '15:00'; </tag></item>
            <item> at 15 <tag> out = '15:00'; </tag></item>
            <item> fifteen <tag> out = '15:00'; </tag></item>
            <item> at fifteen <tag> out = '15:00'; </tag></item>
            <item> 16 <tag> out = '16:00'; </tag></item>
            <item> at 16 <tag> out = '16:00'; </tag></item>
            <item> sixteen <tag> out = '16:00'; </tag></item>
            <item> at sixteen <tag> out = '16:00'; </tag></item>
            <item> 17 <tag> out = '17:00'; </tag></item>
            <item> at 17 <tag> out = '17:00'; </tag></item>
            <item> seventeen <tag> out = '17:00'; </tag></item>
            <item> at seventeen <tag> out = '17:00'; </tag></item>
            <item> 18 <tag> out = '18:00'; </tag></item>
            <item> at 18 <tag> out = '18:00'; </tag></item>
            <item> eighteen <tag> out = '18:00'; </tag></item>
            <item> at eighteen <tag> out = '18:00'; </tag></item>
        </one-of>
    </rule>
    <rule id="help"> 
        <one-of> 
            <item> help <tag> out = 'help'; </tag></item>
            <item> help me <tag> out = 'help'; </tag></item>
            <item> please help <tag> out = 'help'; </tag></item>
            <item> I need help <tag> out = 'help'; </tag></item>
            <item> Help <tag> out = 'help'; </tag></item>
        </one-of> 
    </rule>
    <rule id="yes_no"> 
        <one-of> 
            <item> Yes <tag> out = 'yes'; </tag></item>
            <item> yes </item>
            <item> of course <tag> out = 'yes'; </tag></item>
            <item> absolutely <tag> out = 'yes'; </tag></item>
            <item> yes please <tag> out = 'yes'; </tag></item>
            <item> sure <tag> out = 'yes'; </tag></item>
            <item> No <tag> out = 'no'; </tag></item>
            <item> no <tag> out = 'no'; </tag></item>
            <item> no way <tag> out = 'no'; </tag></item>
            <item> never <tag> out = 'no'; </tag></item>
            <item> absolutely not <tag> out = 'no'; </tag></item>
            <item> never <tag> out = 'no'; </tag></item>
        </one-of> 
    <rule id ="proposition">
        <one-of>


            /* (meet/meeting with) [name] */
            <item>
                <item repeat="0-1">I</item>
                <item repeat="0-1">want</item>
                <item repeat="0-1">would</item>
                <item repeat="0-1">like</item>
                <item repeat="0-1">to</item>
                <item repeat="0-1">Schedule</item>
                <item repeat="0-1">schedule</item>
                <item repeat="0-1">A </item>
                <item repeat="0-1">a </item>
                <item repeat="0-1">Meet</item>
                <item repeat="0-1">meet</item>
                <item repeat="0-1">Meeting</item>
                <item repeat="0-1">meeting</item>
                <item repeat="0-1">With</item>
                <item repeat="0-1">with</item>
                <ruleref uri="#names"/>
                <item repeat="0-1">on</item>
                <tag> 
                out.name = rules.names; 
                out.day = 'None'
                out.time = 'None'
                out.help = 'None'
                out.yes_no = 'None'
                </tag>
            </item>


            /* (meet/meeting with) [name] (on) [day] */
            <item>
                <item repeat="0-1">I</item>
                <item repeat="0-1">want</item>
                <item repeat="0-1">would</item>
                <item repeat="0-1">like</item>
                <item repeat="0-1">to</item>
                <item repeat="0-1">Schedule</item>
                <item repeat="0-1">schedule</item>
                <item repeat="0-1">A </item>
                <item repeat="0-1">a </item>
                <item repeat="0-1">Meet</item>
                <item repeat="0-1">meet</item>
                <item repeat="0-1">Meeting</item>
                <item repeat="0-1">meeting</item>
                <item repeat="0-1">With</item>
                <item repeat="0-1">with</item>
                <ruleref uri="#names"/>
                <item repeat="0-1"> on </item>
                <item repeat="0-1"> next </item>
                <ruleref uri="#days"/>
                <tag> 
                out.name = rules.names; 
                out.day = rules.days;
                out.time = 'None'
                out.help = 'None'
                out.yes_no = 'None'
                </tag>
            </item>


            /* (meet/meeting with) [name] (on) [day] at [time] */
            <item>
                <item repeat="0-1">I</item>
                <item repeat="0-1">want</item>
                <item repeat="0-1">would</item>
                <item repeat="0-1">like</item>
                <item repeat="0-1">to</item>
                <item repeat="0-1">Schedule</item>
                <item repeat="0-1">schedule</item>
                <item repeat="0-1">A </item>
                <item repeat="0-1">a </item>
                <item repeat="0-1">Meet</item>
                <item repeat="0-1">meet</item>
                <item repeat="0-1">Meeting</item>
                <item repeat="0-1">meeting</item>
                <item repeat="0-1">With</item>
                <item repeat="0-1">with</item>
                <ruleref uri="#names"/>
                <item repeat="0-1">on</item>
                <ruleref uri="#days"/>
                <item repeat="0-1">at</item>
                <item repeat="0-1"> next </item>
                <ruleref uri="#time"/>
                <tag> 
                out.name = rules.names; 
                out.day = rules.days;
                out.time = rules.time
                out.help = 'None'
                out.yes_no = 'None'
                </tag>
            </item>


            /* (on) [day] at [time] */
            <item>
                <item repeat="0-1">On</item>
                <item repeat="0-1">on</item>
                <item repeat="0-1"> next </item>
                <ruleref uri="#days"/>
                <item repeat="0-1">at</item>
                <ruleref uri="#time"/>
                <tag> 
                out.name = 'None'; 
                out.day = rules.days;
                out.time = rules.time
                out.help = 'None'
                out.yes_no = 'None'
                </tag>
            </item>

            /* (on) [day] */
            <item>
                <item repeat="0-1">On</item>
                <item repeat="0-1">on</item>
                <item repeat="0-1"> next </item>
                <ruleref uri="#days"/>
                <tag> 
                out.name = 'None'; 
                out.day = rules.days;
                out.time = 'None'
                out.help = 'None'
                out.yes_no = 'None'
                </tag>
            </item>

            /* at [time] */
            <item>
                <item repeat="0-1">at</item>
                <ruleref uri="#time"/>
                <tag> 
                out.name = 'None'; 
                out.day = 'None';
                out.time = rules.time
                out.help = 'None'
                out.yes_no = 'None'
                </tag>
            </item>

            /* help */
            <item>
                <ruleref uri="#help"/>
                <tag> 
                out.name = 'None'; 
                out.day = 'None';
                out.time = 'None';
                out.help = 'Yes';
                out.yes_no = 'None'
                </tag>
            </item>

            /* help */
            <item>
                <ruleref uri="#yes_no"/>
                <tag> 
                out.name = 'None'; 
                out.day = 'None';
                out.time = 'None';
                out.help = 'None'
                out.yes_no = rules.yes_no
                </tag>
            </item>


        </one-of>
    </rule>
</grammar>
`