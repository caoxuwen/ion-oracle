#!/bin/bash
sleep 45

source /home/ubuntu/.bashrc
/usr/bin/forever start /home/ubuntu/ion-oracle/forever/config.json

sleep 5
/usr/bin/forever start /home/ubuntu/ion-oracle/forever/config-liquidation.json

sleep 5
/usr/bin/forever start /home/ubuntu/ion-oracle/forever/config-funding.json