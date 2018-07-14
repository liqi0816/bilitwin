/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SimpleEvent } from '../util/simple-event-target.js';
import { OnEventDuplexFactory } from '../util/event-duplex.js';

class BiliMonkey extends OnEventDuplexFactory<
    { cidchange: SimpleEvent },
    { close: SimpleEvent },
    { onclose: SimpleEvent }
    >(['close']) {
}